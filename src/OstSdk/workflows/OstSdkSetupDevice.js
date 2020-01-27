import OstUser from "../entities/OstUser";
import OstToken from "../entities/OstToken";
import OstKeyManager from "../OstKeyManagerProxy";
import OstSdkBaseWorkflow from "./OstSdkBaseWorkflow";
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";
import OstStateManager from "./OstStateManager";
import OstErrorCodes from '../../common-js/OstErrorCodes'
import OstError from "../../common-js/OstError";

const LOG_TAG = "OstSdk :: OstSdkSetupDevice :: ";

export default class OstSdkSetupDevice extends OstSdkBaseWorkflow {

  constructor( args, browserMessenger ) {
    super(args, browserMessenger);
    console.log(LOG_TAG, "constructor :: ", args);

    this.tokenId = args.token_id;
    this.subscriberId = args.subscriber_id;

    this.initParams()
  }

  initParams() {
    this.deviceRegisteredUUID = null;

    this.currentDevice = null;
    this.user = null;
    this.token = null;

    this.deivceAddress = null;
    this.apiKeyAddress = null;
  }

  status = {
  	CREATED: "created",
  	ACTIVATING: "activating",
  	ACTIVATED: "activated"
  };

  getOrderedStates() {
    let states = OstStateManager.state;
    let orderedStates = [];

    orderedStates.push(states.INITIAL);
    orderedStates.push(states.REGISTERED);

    return orderedStates;
  }

  process() {
    let states = OstStateManager.state;

    switch (this.stateManager.getCurrentState()) {
      case states.REGISTERED:
        this.syncEntities();
        break;
      default:
        super.process();
        break;
    }
  }

  validateParams() {
    //Todo:: Validate params
    if (!this.userId) {
      throw new OstError('os_w_ossd_vp_1', OstErrorCodes.INVALID_USER_ID);
    }

    if (!this.tokenId) {
      throw new OstError('os_w_ossd_vp_2', OstErrorCodes.INVALID_TOKEN_ID);
    }
  }

  onParamsValidated() {
    //Todo:: Initialize OstUser(UserId, TokenId), OstToken(Token Id), OstDevice(ApiAddress, DeviceAddress)
    let oThis = this;

    console.log(LOG_TAG, "onParamsValidated");
    return oThis.initToken()
      .then((token)=> {
        oThis.token = token;
        console.log(LOG_TAG, "initToken :: then");
        return oThis.initUser()
      })
      .then((user) => {
				oThis.user = user;
        console.log(LOG_TAG, "initToken :: then");
        return oThis.getCurrentDevice();
      })
      .then((currentDevice) => {
        if (!currentDevice) {
          return oThis.createDevice()
            .then((deviceEntity) => {
							return oThis.registerDevice();
						});
        } else {
          //Todo :: Sync entities
        }
      })
      .catch((err) => {
        oThis.postError(OstError.sdkError(err, 'os_w_ossd_opv_1'));
      });
  }

  initToken() {
    return OstToken.init(this.tokenId);
  }

  initUser() {
		return OstUser.init(this.userId, this.tokenId);
  }

  getCurrentDevice() {
    //todo: get current device entity
    return Promise.resolve()
  }

  registerDeviceIfRequired() {
    let oThis = this;

    return new Promise((resolve, reject) => {
      console.log(LOG_TAG, "registerDeviceIfRequired");

      if (!oThis.currentDevice || oThis.currentDevice.isStatusRevoked()) {
        oThis.createAndRegisterDevice()
          .then(() => {
            return resolve();

          })
          .catch((err) => {
            return reject(OstError.sdkError(err, 'os_w_ossd_rdif_1'));
          })
      }

      if (oThis.currentDevice.isStatusCreated()) {
        oThis.registerDevice();
        return resolve()
      }
    })

  }

  createAndRegisterDevice() {
    let oThis = this;

    return oThis.createDevice()
      .then(() => {
        oThis.registerDevice();
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_w_ossd_card_1');
      })
  }

  createDevice() {
    let oThis = this;

    return oThis.keyManagerProxy.getDeviceAddress()
      .then((deviceAddress) => {
        oThis.deivceAddress = deviceAddress;
        return oThis.keyManagerProxy.getApiKeyAddress()
      })
      .then((apiKeyAddress)=> {
        oThis.apiKeyAddress = apiKeyAddress;
        return oThis.storeDeviceEntity()
      })
      .catch((err) => {
        throw OstError.sdkError(err, 'os_w_ossd_cd_1')
      })
  }

  storeDeviceEntity() {
    let deviceEntity = {
      device_address: this.deivceAddress,
      api_key_address: this.apiKeyAddress
    };

    //todo: store device entity

    this.currentDevice = deviceEntity;
    return Promise.resolve()
  }

  registerDevice() {
    let message = new OstMessage();
    message.setFunctionName("registerDevice");
    message.setSubscriberId(this.subscriberId);

    //todo: add getter
    let params = {
      api_key_address: this.currentDevice.api_key_address,
      device_address: this.currentDevice.device_address,
      user_id: this.userId
    };
    this.deviceRegisteredUUID = this.browserMessenger.subscribe(this);

    message.setArgs(params, this.deviceRegisteredUUID);

    this.browserMessenger.sendMessage(message, SOURCE.UPSTREAM);
  }

  deviceRegistered ( args ) {
    this.browserMessenger.unsubscribe(this.deviceRegisteredUUID);
    this.performState( OstStateManager.state.REGISTERED, args);
  }

  syncEntities() {
    //Todo: ensureAll Entities (user, device, token)
    console.log(LOG_TAG, "syncEntities");
  }

  //
// return;
//     console.log(LOG_TAG, "Initializing User and Token");
//
//     const ostUser = OstUser.init(this.userId, this.tokenId);
//     const ostToken = OstToken.init(this.tokenId);
//
//     console.log(LOG_TAG, "Creating current device if does not exist");
//     const ostDevice = this.createOrGetCurrentDevice(ostUser);
//     if (!ostDevice) {
//       //post error;
//       return;
//     }
//
//     console.log(LOG_TAG, "Check we are able to access device keys");
//     if (!this.hasDeviceApiKey(ostDevice)) {
//       // return postErrorInterrupt("wf_rd_pr_3", ErrorCode.SDK_ERROR);
//       return;
//     }
//
//     console.log(LOG_TAG, "Check if device has been registered.");
//     if (status.CREATED  ===  ostDevice.getStatus() ) {
//       console.log(LOG_TAG, "Registering device");
//       this.registerDevice(ostDevice);
//       return true;
//     }
//     console.log(LOG_TAG, "Device is already registered. ostDevice.status:" + ostDevice.getStatus() );
//  }


//   createOrGetCurrentDevice(ostUser) {
//     let ostDevice = ostUser.getCurrentDevice();
//     if (ostDevice) {
//       console.debug(TAG, "currentDevice is null");
//       ostDevice = ostUser.createDevice();
//     }
//     return ostDevice;
//   }
//
//   hasDeviceApiKey(ostDevice) {
//     const ostKeyManager = new OstKeyManager(this.userId);
//     return ostKeyManager.getApiKeyAddress() === ostDevice.getApiSignerAddress();
//   }
}
