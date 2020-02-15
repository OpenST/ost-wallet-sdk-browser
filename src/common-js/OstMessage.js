import {SOURCE} from "./OstBrowserMessenger";
import OstError from "./OstError";
import OstErrorCodes from './OstErrorCodes'

class OstMessage {
  static ostMessageFromReceivedMessage( message, ostVerifier, event ) {
    if (!message.signature || !message.ost_message) {
      return null;
    }

    let ostMessage = new OstMessage(message, ostVerifier);

    ostMessage.event = event;
    return ostMessage
  }

  constructor( messagePayload = null, ostVerifier = null ) {

    this.messagePayload = messagePayload || {}; //first preference
    this.ostVerifier = ostVerifier;

    this.signature = null;
    this.timestamp = null;
    this.signer = null;
    this.messageSendTo = null;
    this.receiverName = null;
    this.subscriberId = null;
    this.name = null;
    this.args = null;

    this.event = null;
  }

  //Setter
  setSignature( signature ) {
    this.signature = signature;
  }

  setTimestamp ( timestamp ) {
    this.timestamp = timestamp;
  }

  setSigner ( signer ) {
    this.signer = signer;
  }

  setMessageSendToDirection ( direction ) {
    this.messageSendTo = direction
  }

  setReceiverName ( receiverName ) {
    this.receiverName = receiverName;
  }

  setSubscriberId ( subscriberId ) {
    this.subscriberId = subscriberId;
  }

  setFunctionName (name) {
    this.name = name;
  }

  setArgs ( args, subscriberId ) {
    if(subscriberId===undefined){
      this.args = Object.assign( args );
    }
    else{
      this.args = Object.assign( args, {subscriber_id : subscriberId} );
    }
  }

  //Getter

  getSignature ( ) {
    return this.messagePayload.signature || this.signature;
  }

  getOstMessage ( )  {
    if ( !this.messagePayload ) {
      return {}
    }
    return this.messagePayload.ost_message || {};
  }

  getFrom ( ) {
    const message = this.getOstMessage();

    return message.from || {};
  }

  getTo ( ) {
    const message = this.getOstMessage();

    return message.to || {};
  }

  getMethodDetails ( ) {
    const message = this.getOstMessage();

    return message.method_details || {};
  }

  getTimestamp ( ) {
    let timestamp = this.getOstMessage().timestamp || this.timestamp;
    if ( !timestamp ) {
      this.timestamp = Date.now();
      timestamp  = this.timestamp;
    }
    return timestamp
  }

  getSigner ( ) {
    return this.getFrom().signer || this.signer;
  }

  getOrigin ( ) {
    return this.getFrom().origin || window.origin
  }

  getMessageSendToDirection ( ) {
    return this.getOstMessage().message_sent_to || this.messageSendTo;
  }

  getReceiverName ( ) {
    return this.getTo().receiver_name || this.receiverName;
  }

  getSubscriberId ( ) {
    return this.getTo().subscriber_id || this.subscriberId;
  }

  getMethodName ( ) {
    return this.getMethodDetails().name || this.name;
  }

  getArgs ( ) {
    return this.getMethodDetails().args || this.args;
  }

  //Build
  buildPayloadToSign ( ) {
    return {
      timestamp: this.getTimestamp(),

      from: {
        signer: this.getSigner(),
        origin: this.getOrigin(),
      },

      message_sent_to: this.getMessageSendToDirection(),

      to: {
        receiver_name: this.getReceiverName(),
        subscriber_id: this.getSubscriberId()
      },

      method_details: {
        name: this.getMethodName(),
        args: this.getArgs()
      },

      ost_verifiable_message: true
    }
  }

  buildPayloadToSend ( ) {
    return {
      signature: this.getSignature(),
      ost_message: this.buildPayloadToSign()
    }
  }

  //
  isReceivedFromUpstream() {
    return SOURCE.DOWNSTREAM === this.getMessageSendToDirection()
  }

  isReceivedFromDownstream() {
    return SOURCE.UPSTREAM === this.getMessageSendToDirection()
  }

  //Verify
  isVerifiedMessage ( ) {
    let oThis = this;

    return new Promise((resolve, reject) => {

      if ( !oThis.getSubscriberId() ) {
        console.log("OstMessage :: isVerifiedMessage :: SubscriberId not persent");
        let receiverName = oThis.getReceiverName();

        console.log("OstMessage :: ostVerifier receiver name : ", oThis.ostVerifier.receiverName);
        if ( !oThis.ostVerifier.isValidReceiver( receiverName ) ) {
          console.log("OstMessage :: isVerifiedMessage :: invalid receiverName name :: ", receiverName);
          return reject();
        }
        console.log("OstMessage :: isVerifiedMessage :: valid receiverName name :: ", receiverName);
      }

      if ( oThis.isReceivedFromDownstream() )  {
        console.log("Message received from down stream");

        if ( !oThis.ostVerifier.isDownstreamSigner( oThis.getSigner() ) ) {
          return reject( new OstError('cj_om_ivm_1', OstErrorCodes.INVALID_DOWNSTREAM_PUBLIC_KEY) );
        }

        if ( !oThis.ostVerifier.isDownstreamOrigin( oThis.getOrigin() ) ) {
          return reject( new OstError('cj_om_ivm_2', OstErrorCodes.INVALID_DOWNSTREAM_ORIGIN) );
        }

        return oThis.ostVerifier.isValidSignature(
          oThis.getSignature(),
          oThis.buildPayloadToSign(),
          oThis.ostVerifier.downstreamPublicKey
        )
          .then ((isVerified) => {
            console.log("then :: isVerifiedMessage :: ", isVerified);
            if (isVerified) {
              return resolve(isVerified)
            }

            return reject()
          })
          .catch((err) => {
            console.log("catch :: isVerifiedMessage :: ", err);

            throw OstError.sdkError(err, 'cj_om_ivm_3');
          })
      }

      if ( oThis.isReceivedFromUpstream() ) {
        console.log("Message received from up stream");

        if ( !oThis.ostVerifier.isUpstreamSigner( oThis.getSigner() ) ) {
          return reject( new OstError('cj_om_ivm_4', OstErrorCodes.INVALID_UPSTREAM_PUBLIC_KEY) );
        }

        if ( !oThis.ostVerifier.isUpstreamEvent( this.event ) ) {
          return reject( new OstError('cj_om_ivm_5', OstErrorCodes.INVALID_UPSTREAM_ORIGIN) );
        }

        return oThis.ostVerifier.isValidSignature(
          oThis.getSignature(),
          oThis.buildPayloadToSign(),
          oThis.ostVerifier.upstreamPublicKey
        )
          .then ((isVerified) => {
            console.log("then :: isVerifiedMessage :: ", isVerified);
            if (isVerified) {
              return resolve(isVerified)
            }

            return reject()
          })
          .catch((err) => {
            console.log("catch :: isVerifiedMessage :: ", err);

            throw OstError.sdkError(err, 'cj_om_ivm_6');
          })
      }

      return reject(OstError.sdkError(null, 'cj_om_ivm_7'));

    });
  }
}

export default OstMessage

/*
- Sample OstMessage Structure
{
  "ost_varifiable_message": true,
	"signature": "0x",
	"ost_message": {
		timestamp: 123123123,
		from: {
			signer: "",
			origin: "",
		},
		"messgae_sent_to": "UP/DOWN",

		to: {
			"receiver_name": "OstSdk"
		},

		method_details: {
			"name": "getCurrentUser",
			"args": {
				"user_id": "4321-2121-4321-12123-user",
				"subscriber_id": "1234-1212-12121234-success",
			}
		}
	}
}
 */