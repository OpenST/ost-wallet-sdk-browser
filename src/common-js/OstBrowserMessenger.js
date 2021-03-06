/**
 * OstBrowserMessenger is a wrapper class that internally
 * uses Window.postMessage Api for inter-window communication.
 * For Information, see:
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
 *
 */

import OstError from "./OstError";

import OstHelpers from "./OstHelpers/OstHelpers";
import OstMessage from "./OstMessage";
import uuidv4 from 'uuid/v4';
import OstErrorCodes  from './OstErrorMessages'

const SOURCE = {
  UPSTREAM: "UPSTREAM",
  DOWNSTREAM: "DOWNSTREAM"
};

let LOG_TAG = "OstMessenger";
class OstBrowserMessenger {

  constructor( receiverName, upStreamOrigin, windowParent ) {

    this.defineImmutableProperty("receiverName", receiverName);
    this.defineImmutableProperty("parentWindow", windowParent);
    if ( upStreamOrigin ) {
      this.defineImmutableProperty("upStreamOrigin", upStreamOrigin);
    }

    this.signer = null;
    this.downStreamOrigin = null;

    this.publicKeyHex = null;

    this.upstreamPublicKeyHex = null;
    this.upstreamPublicKey = null;

    this.downstreamPublicKeyHex = null;
    this.downstreamPublicKey = null;

    this.defineImmutableProperty("idMap", {});

    LOG_TAG = LOG_TAG + "-" + receiverName;
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
    let oThis = this;
    window.addEventListener("message", (event) => {
      oThis.onMessageReceived(event);
    }, false);
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

  onMessageReceived(event) {
    if (!event.isTrusted) {
      return;
    }

    // Validate Source.
    let expected_origin = null;
    let expected_signer = null;
    let message_source  = null;

    if ( event.source === this.parentWindow ) {
      // Parent sent the message downstream to us.
      expected_origin = this.upStreamOrigin;
      expected_signer = this.upstreamPublicKey;
      message_source  = SOURCE.UPSTREAM;
    } else if ( event.source === this.downStreamWindow ) {
      // Child sent messgae to us.
      expected_origin = this.downStreamOrigin;
      expected_signer = this.downstreamPublicKey;
      message_source  = SOURCE.DOWNSTREAM;
    } else {
      //Not a valid sender. Ignore the message.
      return;
    }

    // Validate Origin
    if ( event.origin !==  expected_origin) {
      // console.error("|||*** Not a valid expected origin.", event.origin, expected_origin);
      return;
    }

    let oThis = this;

    const eventData = event.data;

    if (!eventData) {
      return;
    }

    if ( !eventData.ost_message ) {
      return;
    }

    const ostMessage = OstMessage.ostMessageFromReceivedMessage( eventData );

    if ( !ostMessage ) {
      return;
    }

    oThis.verifySignature(expected_signer, ostMessage)
        .then ((isVerified) => {
          console.log(":: onMessageReceived :: then of verifySignature  :: ", isVerified);
          if (isVerified) {
            oThis.onValidMessageReceived(ostMessage);
          }
        })
        .catch ((err) => {
          oThis.onOtherMessageReceived(ostMessage, message_source, err);
        });
  }

  verifySignature( expectedSigner, ostMessage ) {
    const oThis = this;

    return oThis.isValidSignature(
      ostMessage.getSignature(),
      ostMessage.buildPayloadToSign(),
      expectedSigner
    )
      .then ((isVerified) => {
        console.log("verifySignature :: then of isValidSignature :: ", isVerified);
        if (isVerified) {
          return isVerified
        }

        throw new OstError('cj_om_ivm_1', OstErrorCodes.INVALID_SIGNATURE);
      })
      .catch((err) => {
        console.log("verifySignature :: catch of isValidSignature ::  ", err);

        throw OstError.sdkError(err, 'cj_om_ivm_2');
      });
  }

  isValidSignature(signature, payloadToSign, expectedSigner) {

    if (!(expectedSigner instanceof CryptoKey)) {
      return Promise.reject(new OstError('cj_om_ivs_1', OstErrorCodes.SDK_RESPONSE_ERROR))
    }

    return crypto.subtle.verify({
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256"
      },
      expectedSigner,
      OstHelpers.hexToByteArray( signature ),
      OstHelpers.getDataToSign( payloadToSign )
    );
  }

  onValidMessageReceived(ostMessage) {
    console.log(LOG_TAG, ":: onValidMessageReceived : ", ostMessage);

    let functionId = ostMessage.getSubscriberId();

    if ( !functionId ) {
      functionId = ostMessage.getReceiverName()
    }

    console.log(LOG_TAG, ":: onValidMessageReceived : functionId: ", functionId);

    let subscribedObject = this.getSubscribedObject( functionId );

    if ( subscribedObject ) {
      console.log(LOG_TAG, "onValidMessageReceived :: got subscribed object", subscribedObject);
      const method = subscribedObject[ostMessage.getMethodName()];

      console.log(LOG_TAG, "onValidMessageReceived :: typeof method", typeof method, "method", method);
      if (method && typeof method === 'function') {
        method.call(subscribedObject, ostMessage.getArgs());
      } else {
        console.error(LOG_TAG, "onValidMessageReceived :: typeof method", typeof method, "method", method);
      }
    }else  {
      console.log(LOG_TAG, "OstBrowserMessenger :: onOtherMessageReceived :: subscribed object not found for ::", functionId );
      console.log(this.idMap);
    }
  }

  onOtherMessageReceived( ostMessage, message_source, err) {
    console.log(LOG_TAG, "onOtherMessageReceived :: ostMessage.getMethodName() :: ", ostMessage.getMethodName());
    if ( message_source === SOURCE.DOWNSTREAM && null === this.downstreamPublicKey ) {
      if (this.receiverName === ostMessage.getReceiverName() ) {
        if ( 'onSetupComplete' === ostMessage.getMethodName() ) {
          return this.onValidMessageReceived(ostMessage);  
        }
      }
    }
    throw err;
  }

  exportPublicKey() {
    return crypto.subtle.exportKey('spki', this.signer.publicKey)
      .then((res) => {
        this.publicKeyHex = OstHelpers.byteArrayToHex(res);
      })
  }

  //Setter

  //TODO: To be Deprecated.
  //@Deprecated
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
    console.log(LOG_TAG, 'setDownStreamOrigin', downStreamOrigin);
  }

  setUpstreamPublicKeyHex(hex) {
    const oThis = this;
    
    return oThis.importPublicKey(hex)
      .then((cryptoKey) => {
        oThis.defineImmutableProperty("upstreamPublicKey", cryptoKey);
        oThis.defineImmutableProperty("upstreamPublicKeyHex", hex);
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('cj_obm_sppkh_1', 'SKD_INTERNAL_ERROR', err);
      });
  }

  importPublicKey(hex) {
    const arrayBuffer = OstHelpers.hexToByteArray(hex);
    return crypto.subtle.importKey('spki', arrayBuffer, {name: 'RSASSA-PKCS1-v1_5', hash: 'sha-256'}, true, ['verify']);
  }

  setDownstreamPublicKeyHex(hex) {
    const oThis = this;

    if (!hex || typeof hex !== 'string') {
      let err = new Error("Invalid Downstream Public Key Hex");
      let ostError = OstError.sdkError(err , "obm_sdspkh_1");
      return Promise.reject( ostError );
    }

    return oThis.importPublicKey(hex)
      .then((cryptoKey) => {
        /**
         * The downstream public keys are not immutable by design.
         * Making them immutable will enfore that only one downstream can be initiated.
         * This limitation will be blocking if the dowstream has been created, but,
         * somehow the setup fails.
         *
         * Making it immutable gives application an option to retry initialization of sdk.
         */
        oThis.downstreamPublicKey = cryptoKey;
        oThis.downstreamPublicKeyHex = hex;
      })
      .catch((err) => {
        if (err instanceof OstError) {
          throw err;
        }
        throw new OstError('cj_obm_scpkh_1', 'SKD_INTERNAL_ERROR', err);
      });
  }

  removeDownstreamPublicKey() {
    this.downstreamPublicKey = null;
    this.downstreamPublicKeyHex = null;
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
      console.log(LOG_TAG, "this.upStreamOrigin", this.upStreamOrigin);
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

  isValidSigner() {
    if (!this.signer) {
      return false
    }

    if (typeof this.signer !== 'object' ) {
      return false;
    }

    return (this.signer.publicKey instanceof CryptoKey) && (this.signer.privateKey instanceof CryptoKey);
  }

  //Performable
  sendMessage(ostMessage, receiverStream) {

    if ( !(ostMessage instanceof OstMessage) ) {
      throw new OstError('cj_obm_sm_1', 'INVALID_OST_MESSAGE')
    }

    if (!SOURCE.hasOwnProperty( receiverStream )) {
      throw new OstError('cj_obm_sm_2', 'INVALID_ENUM')
    }

    if (!this.isValidSigner()) {
      throw new OstError('cj_obm_sm_3', 'INVALID_SIGNER')
    }

    let targetWindow;
    let targetOrigin;
    if (SOURCE.DOWNSTREAM === receiverStream) {
      targetWindow = this.getDownStreamWindow();
      targetOrigin = this.getDownStreamOrigin();

    } else if (SOURCE.UPSTREAM === receiverStream) {
      targetWindow = this.getUpStreamWindow();
      targetOrigin = this.getUpStreamOrigin();
    }

    const dataToSign = ostMessage.buildPayloadToSign();

    return this.getSignature(dataToSign)
      .then((signedMessage) => {
        console.log(LOG_TAG, "signature generated.");
        const signature = OstHelpers.byteArrayToHex( signedMessage );

        ostMessage.setSignature( signature );

        console.log(LOG_TAG, "OstBrowserMessenger :: sendMessage ::  ", ostMessage.buildPayloadToSend());

        targetWindow.postMessage(ostMessage.buildPayloadToSend(), targetOrigin);
      }).catch((err) => {
        console.log(LOG_TAG, "signature generation failed.");

        throw OstError.sdkError(err,'cj_obm_sm_5');
      });
  }

  getSignature(payload) {
    return crypto.subtle.sign({
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
      },
      this.signer.privateKey,
      OstHelpers.getDataToSign(payload));
  }

  verifyIframeInit(url, signature) {
    return crypto.subtle.verify({
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
      },
      this.upstreamPublicKey,
      OstHelpers.hexToByteArray(signature), OstHelpers.getDataToSign(url));
  }

  subscribe(obj, name) {

    if (!name || typeof name !== 'string') {
      name = uuidv4();
    }

    this.idMap[name] = obj;

    console.log(LOG_TAG, "subscribing for :: ", name, " on :: ", this.receiverName);
    return name;
  }

  unsubscribe(name) {
    if (!name || typeof name !== 'string') {
      return;
    }

    delete this.idMap[name];
  }

  getSubscribedObject(name) {
    if (!name || typeof name !== 'string') {
      return null;
    }

    return this.idMap[name];
  }

  /**
   * shallowCloneToImmutableObject - shallow clones the input object such that properties of returned objet are immutable.
   * @param  {Object} input Object to be cloned.
   * @return {Object}       Shallow cloned object.
   */
  shallowCloneToImmutableObject( input ) {
    const output = {};
    for( let k in input ) {
      let v = input[k];
      Object.defineProperty(output, k, {
        "value": v,
        "writable": false
      })
    }
    return output;
  }


  /**
   * defineImmutableProperty defines the property on 'this' scope, sets the value such that property is immutable.
   * @param  {String} propName Name of the property to be defined.
   * @param  {Any} val         Value of the property to be set.
   */
  defineImmutableProperty(propName, val) {
    Object.defineProperty( this, propName, {
      "value": val,
      "writable": false
    })
  }
}

export {SOURCE, OstBrowserMessenger};
