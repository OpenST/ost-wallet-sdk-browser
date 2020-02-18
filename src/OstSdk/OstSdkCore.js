import {SOURCE} from '../common-js/OstBrowserMessenger'
import OstBaseSdk from '../common-js/OstBaseSdk';
import OstSdkAssist from './OstSdkAssist'
import OstMessage from '../common-js/OstMessage'
import {OstBaseEntity} from "./entities/OstBaseEntity";
import OstApiClient from "../Api/OstApiClient";
import OstError from "../common-js/OstError";
import EC from '../common-js/OstErrorCodes';

const LOG_TAG = "OstSdk :: index :: ";

class OstSdk extends OstBaseSdk {
  constructor(window, parentOrigin){
    super(window, parentOrigin);
    this.ostSdkAssist = null
  }

  createOstSdkAssist () {
    let oThis = this;
    this.ostSdkAssist = new OstSdkAssist(this.browserMessenger, this.getReceiverName());
    console.log(LOG_TAG, "ostSdkAssist created");
    this.ostSdkAssist.onSetupComplete = function (args) {
      console.log(LOG_TAG,"createOstSdkAssist :: onSetupComplete", args);
      oThis.onSetupComplete(args)
    }
  }

  createAssist() {
    const oThis = this;
    return oThis.createOstSdkAssist();
  }

  initDBInstance() {
    return OstBaseEntity.initInstance();
  }

  getReceiverName() {
    return 'OstSdk';
  }

  sendPublicKey() {
    const oThis = this;
    console.log("sending OstSdk public key");

    let ostMessage = new OstMessage();
    ostMessage.setFunctionName( "onSetupComplete" );
    ostMessage.setReceiverName( oThis.getUpstreamReceiverName() );
    ostMessage.setArgs({
      publicKeyHex: oThis.browserMessenger.getPublicKeyHex()
    });

    return oThis.browserMessenger.sendMessage(ostMessage, SOURCE.UPSTREAM);
  }

  onSetupComplete (args) {
    const oThis = this;
    return super.onSetupComplete(args)
      // Inform self.
      .then(() => {
        oThis.onDownstreamInitialzed(args);
        return true;
      })
  }

  getUpstreamReceiverName() {
    return "OstWalletSdk";
  }

  getDownstreamEndpoint() {
    const oThis = this;
    const selfOrigin = oThis.origin;
    const kmOrigin = selfOrigin.replace("https://sdk-", "https://km-");
    const kmEndpoint = kmOrigin + oThis.pathname;
    console.log("kmEndpoint", kmEndpoint);
    return kmEndpoint;
  }

	verifyIframeInitData(...args) {
		const oThis = this
		;
		return super.verifyIframeInitData(...args)
			.then((verified) => {
				if (!verified) {
					return verified;
				}
				return oThis.isWhiteListedParent();
			})
	}

	isWhiteListedParent() {
      const oThis = this
        , parentOrigin = oThis.ancestorOrigins[0]
        , token_id = oThis.sdkConfig.token_id
        , apiEndPoint = oThis.sdkConfig.api_endpoint
      ;

      return new OstApiClient('', apiEndPoint).validateDomain(token_id, parentOrigin)
        .then((res) => {
          if (res) {
            return res;
          }

          throw new OstError('os_osc_iwlp_1', EC.INVALID_UPSTREAM_ORIGIN);
        })
    }
}

export default OstSdk;
