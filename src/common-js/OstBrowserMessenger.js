/**
 * OstBrowserMessenger is a wrapper class that internally
 * uses Window.postMessage Api for inter-window communication.
 * For Information, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 *
 */

import OstError from "./OstError";
import {MESSAGE_TYPE, OstMessage} from "./OstMessage";
import OstHelpers from "./OstHelpers";
import OstErrorCodes from "./OstErrorCodes";
import EventEmitter from 'eventemitter3';

const SOURCE = {
  UPSTREAM: "UPSTREAM",
  DOWNSTREAM: "DOWNSTREAM"
};

const MESSAGE_TIMESTAMP_THRESHOLD = '1000';

class OstBrowserMessenger {

  constructor() {
    this.signer = null;
    this.downStreamOrigin = null;

    this.publicKeyHex = null;

    this.parentPublicKeyHex = null;
    this.parentPublicKey = null;

    this.childPublicKeyHex = null;
    this.childPublicKey = null;

    this.eventEmitter = new EventEmitter();
  }

  perform() {
		this.registerListener();

		return this.createSignerKey()
      .then((res) => {
        this.signer = res;
        return this.exportPublicKey();
      });
  }

  registerListener() {
		window.addEventListener("message", (event) => {
			this.receiveMessage(event);
		}, false);
  }


	receiveMessage(event) {
		const eventData = event.data;
		const message = eventData.message;

		if (!message) {
		  return;
    }

		if (!this.isValidTimeStamp(message.timestamp)) {
			console.warn("OstBrowserMessenger :: receiveMessage :: invalid time stamp");
		  return;
    }

    if (!this.isValidOrigin(event.origin)) {
			console.warn("OstBrowserMessenger :: receiveMessage :: invalid origin");
      return;
    }

			if ([MESSAGE_TYPE.OST_SKD_KM_SETUP_COMPLETE,
					MESSAGE_TYPE.OST_SKD_SETUP_COMPLETE].includes(eventData.message.type)) {

				//this.onSetupComplete(eventData);
        this.eventEmitter.emit(eventData.message.type, eventData);

			}else {

				this.validateReceivedMessage(eventData)
					.then((isVerified) => {
					  this.onValidateReceivedMessageCallback(isVerified, message);
					})
					.catch((err) => {
						throw OstError.sdkError(err, "cs_obm_rm_1");
					});
			}
	}

	isValidTimeStamp( timestamp ) {
		const currentDate = Date.now();
		if ((currentDate - MESSAGE_TIMESTAMP_THRESHOLD) < timestamp || (currentDate + MESSAGE_TIMESTAMP_THRESHOLD) > timestamp ) {
			return true;
		}
		return false;
	}

	isValidOrigin(origin) {
  	console.log("isValidOrigin : origin => ", origin);
		console.log("isValidOrigin : downStreamOrigin => ", this.downStreamOrigin);
		console.log("isValidOrigin : upStreamOrigin => ", this.upStreamOrigin);
    return this.downStreamOrigin == origin || this.upStreamOrigin == origin ;
  }


	validateReceivedMessage(eventData) {
		let signer = eventData.message.signer;
    if (!signer) {
      throw new OstError('cs_obm_vrm_1', OstErrorCodes.INVALID_SIGNER);
    }
		if (this.isParentPublicKey(signer)) {
			return this.verifyParentMessage(eventData)

    }

    if (this.isChildPublicKey(signer)){
			return this.verifyChildMessage(eventData)
		}

		return Promise.resolve(false);
	}


	onValidateReceivedMessageCallback(isVerified, message)
  {
    if (isVerified) {
     //Event emitter
      console.log("onValidateReceivedMessageCallback : message => ",message);
      this.eventEmitter.emit(message.type, message);
    }
  }

	/**
   * Method to create message signer.
   * @return {Promise} a Promise that fulfills with a CryptoKeyPair.
   */
  createSignerKey() {
    return crypto.subtle.generateKey(
      {
        name: "RSASSA-PKCS1-v1_5",
        modulusLength: 2048, //can be 1024, 2048, or 4096
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: {name: "SHA-256"}, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
      },
      false, //whether the key is extractable (i.e. can be used in exportKey)
      ["sign", "verify"] //can be any combination of "sign" and "verify"
    );
  }

  exportPublicKey() {
    return crypto.subtle.exportKey('spki', this.signer.publicKey)
      .then((res) => {
        this.publicKeyHex = OstHelpers.byteArrayToHex(res);
      })
  }

  importPublicKey(hex) {
    const arrayBuffer = OstHelpers.hexToByteArray(hex);
    return crypto.subtle.importKey('spki', arrayBuffer, {name: 'RSASSA-PKCS1-v1_5', hash: 'sha-256'}, true, ['verify']);
  }

  //Setter

  setUpStreamOrigin( upStreamOrigin ) {
    this.upStreamOrigin = upStreamOrigin;
  }

  setDownStreamWindow( downStreamWindow ) {
    if ( typeof window !== 'object' || typeof self !== 'object' || window !== self ) {
      throw new OstError('cj_obm_obm_1', 'INVALID_TARGET_WINDOW');
    }
    this.downStreamWindow = downStreamWindow;
  }

  setDownStreamOrigin( downStreamOrigin ) {
    this.downStreamOrigin = downStreamOrigin;
    console.log('setDownStreamOrigin', downStreamOrigin);
  }

  setParentPublicKeyHex(hex) {
    this.parentPublicKeyHex = hex;
    return this.importPublicKey(this.parentPublicKeyHex)
      .then((cryptoKey) => {
        this.parentPublicKey = cryptoKey;
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('cj_obm_sppkh_1', 'SKD_INTERNAL_ERROR', err);
      });
  }

  setChildPublicKeyHex(hex) {
    this.childPublicKeyHex = hex;
    return this.importPublicKey(this.childPublicKeyHex)
      .then((cryptoKey) => {
        this.childPublicKey = cryptoKey;
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('cj_obm_scpkh_1', 'SKD_INTERNAL_ERROR', err);
      });
  }

  removeParentPublicKey() {
    this.childPublicKey = null;
    this.childPublicKeyHex = null;
  }

  removeChildPublicKey() {
    this.parentPublicKey = null;
    this.parentPublicKeyHex = null;
  }

  //getter

  getUpStreamWindow() {
    if ( typeof window !== 'object' || typeof self !== 'object' || window !== self ) {
      throw new OstError('cj_obm_gusw_1', 'INVALID_TARGET_WINDOW');
    }

    return window.parent;
  }

  getUpStreamOrigin() {
    if (!this.upStreamOrigin || typeof this.upStreamOrigin !== 'string' ) {
      throw new OstError('cj_obm_guso_1', 'INVALID_UPSTREAM_ORIGIN');
    }

    return this.upStreamOrigin;
  }

  getDownStreamWindow() {
    let windowRef = this.downStreamWindow;

    if (!windowRef || typeof windowRef !== 'object') {
      throw new OstError('cj_obm_gusw_1', 'INVALID_TARGET_WINDOW');
    }

    return windowRef;
  }

  getDownStreamOrigin() {
    if (!this.downStreamOrigin || typeof this.downStreamOrigin !== 'string') {
      throw new OstError('cj_obm_gdso_1', 'INVALID_DOWNSTREAM_ORIGIN');
    }

    return this.downStreamOrigin
  }


  getPublicKeyHex() {
    return this.publicKeyHex;
  }


  isParentPublicKey(hex) {
    return this.parentPublicKeyHex === hex;
  }

  isChildPublicKey(hex) {
    return this.childPublicKeyHex === hex;
  }

	registerOnce(type, callback) {
		this.eventEmitter.once(type, callback);
	}

	register(type, callback) {
		this.eventEmitter.on(type, callback);
	}

	unRegister(type, callback) {
		this.eventEmitter.removeListener(type, callback);
	}
  //Verify

  isValidSigner() {
    if (!this.signer) {
      return false
    }

    if (typeof this.signer !== 'object' ) {
      return false;
    }

    return (this.signer.publicKey instanceof CryptoKey) && (this.signer.privateKey instanceof CryptoKey);
  }

  isValidParentPublicKey() {
    if (!this.parentPublicKey) {
      return false
    }

    return (this.parentPublicKey instanceof CryptoKey)
  }

  isValidChildPublicKey() {
    if (!this.childPublicKey) {
      return false
    }

    return (this.childPublicKey instanceof CryptoKey)
  }

  //Performable
  sendMessage(ostMessage, receiverSourceEnum) {

    if (!(ostMessage instanceof OstMessage)) {
      throw new OstError('cj_obm_sm_1', 'INVALID_OST_MESSAGE')
    }

    if (!SOURCE.hasOwnProperty(receiverSourceEnum)) {
      throw new OstError('cj_obm_sm_2', 'INVALID_ENUM')
    }

    if (!this.isValidSigner()) {
      throw new OstError('cj_obm_sm_3', 'INVALID_SIGNER')
    }

    let targetWindow;
    let targetOrigin;
    if (SOURCE.DOWNSTREAM == receiverSourceEnum) {
      targetWindow = this.getDownStreamWindow();
      targetOrigin = this.getDownStreamOrigin();
    } else if (SOURCE.UPSTREAM == receiverSourceEnum) {
      targetWindow = this.getUpStreamWindow();
      targetOrigin = this.getUpStreamOrigin();
    }

    const dataToSign = OstHelpers.getMessageToSign(ostMessage, this.publicKeyHex);

    return this.getSignature(dataToSign)
      .then((signedMessage)=>{

        const signature = OstHelpers.byteArrayToHex(signedMessage);

        const dataToPost = OstHelpers.getPostMessageData(signature, ostMessage, this.publicKeyHex);

        targetWindow.postMessage(dataToPost, targetOrigin);
      }).catch((err)=>{
      if (err instanceof OstError) {
        throw err;
      }
      throw new OstError('cj_obm_sm_5', 'SKD_INTERNAL_ERROR', err);
    });
  }

  getSignature(payload) {
    return crypto.subtle.sign('RSASSA-PKCS1-v1_5', this.signer.privateKey, OstHelpers.getDataToSign(payload));
  }

  verifyParentMessage(data) {
    if (!this.isValidParentPublicKey()) {
      throw new OstError('cj_obm_vpm_1', 'INVALID_PARENT_PUBLIC_KEY')
    }

    const signature = data.signature;
    if (!signature || typeof signature !== 'string') {
      throw new OstError('cj_obm_vpm_2', 'INVALID_PARAM_SIGNATURE')
    }

    const message = data.message;
    return this.verify(message, signature, this.parentPublicKey);
  }

  verifyChildMessage(data) {
    if (!this.isValidChildPublicKey()) {
      throw new OstError('cj_obm_vcm_1', 'INVALID_CHILD_PUBLIC_KEY')
    }

    const signature = data.signature;
    if (!signature || typeof signature !== 'string') {
      throw new OstError('cj_obm_vcm_2', 'INVALID_PARAM_SIGNATURE')
    }

    const message = data.message;
    return this.verify(message, signature, this.childPublicKey);
  }

  verify(message, signature, publicKey) {
    return crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, OstHelpers.hexToByteArray(signature), OstHelpers.getDataToSign(message))
  }
}

export {SOURCE, OstBrowserMessenger};
