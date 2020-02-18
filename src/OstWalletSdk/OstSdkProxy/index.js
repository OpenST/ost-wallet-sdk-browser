
import OstMessage from "../../common-js/OstMessage";
import {SOURCE} from "../../common-js/OstBrowserMessenger";

const LOG_TAG = 'OstSdkProxy :: ';

class OstSdkProxy {
    constructor(messengerObj){
        this.messengerObj = messengerObj;
    }

    getUser(userId) {
        let oThis = this;
        let functionParams = {
            user_id: userId,
        };

        return oThis.getFromOstSdk('getUser', functionParams)
            .then((response) => {
              const user = response.user;
              if (!user) {
                return {}
              }

              const userData = user.data;
              if (!userData) {
                return {}
              }

              return userData;
            })
            .catch((err) => {
              const error = err.err;
              if (!err) {
                throw err;
              }
              throw error;
            })
    }

    getToken( token_id) {
        let oThis = this;
            let functionParams = {
                token_id: token_id,
            };

            return oThis.getFromOstSdk('getToken', functionParams)
                .then((response) => {
                  const token = response.token;
                  if (!token) {
                    return {}
                  }

                  const tokenData = token.data;
                  if (!tokenData) {
                    return {}
                  }

                  return tokenData;
                })
              .catch((err) => {
                const error = err.err;
                if (!err) {
                  throw err;
                }
                throw error;
              });
    }

    getDevice(userId) {
        let oThis = this;
            let functionParams = {
                user_id: userId,
            };

            return oThis.getFromOstSdk('getDevice', functionParams)
                .then((response) => {
                 const device = response.device;
                  if (!device) {
                    return {}
                  }

                  const deviceData = device.data;
                  if (!deviceData) {
                    return {}
                  }

                  return deviceData;
                })
              .catch((err) => {
                const error = err.err;
                if (!err) {
                  throw err;
                }
                throw error;
              });
    }

    getActiveSessions(userId, spendingLimit) {
        let oThis = this;
            let functionParams = {
                user_id: userId,
                spending_limit: spendingLimit,
            };

            return oThis.getFromOstSdk('getActiveSessions', functionParams)
                .then((response) => {
                  const activeSessions = response.activeSessions;
                  if (!activeSessions) {
                    return []
                  }

                  return activeSessions
                })
              .catch((err) => {
                const error = err.err;
                if (!err) {
                  throw err;
                }
                throw error;
              })  ;
            }

  deleteLocalSessions(userId) {
      let oThis = this;
      const functionParams = {
        user_id: userId
      };

      return oThis.getFromOstSdk('deleteLocalSessions', functionParams)
        .then((response) => {
          return true;
        })
        .catch((err) => {
          return false;
        });
    }


    getFromOstSdk(functionName, functionParams) {
        let oThis = this;
		return new Promise((resolve, reject) => {

			let subId = this.messengerObj.subscribe(new ResponseHandler(
				function (args) {
					console.log(LOG_TAG, `${functionName} get`, args);
					oThis.messengerObj.unsubscribe(subId);
					resolve(args);
				},
				function ( args ) {
					console.log(LOG_TAG, `${functionName} error`, args);
					oThis.messengerObj.unsubscribe(subId);
					reject(args);
				}
			));

			let message  = new OstMessage();
			message.setReceiverName("OstSdk");
			message.setFunctionName(functionName);
			message.setArgs(functionParams, subId);
			console.log(LOG_TAG, functionName);
			this.messengerObj.sendMessage(message, SOURCE.DOWNSTREAM);
		});
    }

}

const ResponseHandler = function (success, error){
	const oThis = this;

	oThis.onSuccess = function(args) {
			return success(args.data);
	};

	oThis.onError = function(args) {
		return error(args.err);
	};

};

export default OstSdkProxy;
