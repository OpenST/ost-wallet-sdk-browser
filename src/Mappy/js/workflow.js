import '../css/login.css';
import OstSetup from "./common";
//Todo:: remove common.js and use pageIntializer instead
var ostSetup;
class Workflows {

    constructor() {
        ostSetup = new OstSetup();
    }

    setupDeviceWorkflow(){
        let workflowDelegate =  new OstSetupDeviceDelegate();

        workflowDelegate.registerDevice = function( apiParams ) {
          return Promise.reject("registerDevice not allowed here.");
        };

        workflowDelegate.requestAcknowledged = (ostWorkflowContext , ostContextEntity) => {
            var object = {};
            var object2 = {};
            object2.ost_context_entity = ostContextEntity;
            object2.ost_workflow_context = ostWorkflowContext;
            object.root = object2;

            console.log("requestAcknowledged ---> ",object);
        };

        workflowDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
            var object = {};
            var object2 = {};
            object2.ost_context_entity = ostContextEntity;
            object2.ost_workflow_context = ostWorkflowContext;
            object.root = object2;

            console.log("flowComplete ---> ",object);
        };

        workflowDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
            var object = {};
            var object2 = {};
            object2.ost_context_entity = ostError;
            object2.ost_workflow_context = ostWorkflowContext;
            object.root = object2;

            console.log("flowInterrupt ---> ",object);
        };

        ostSetup.getCurrentUser()
        .then((currentUser) => {

          console.log("user_id =======> ",currentUser.user_id);
          let workflowId = OstSdkWallet.setupDevice(
            currentUser.user_id,
            currentUser.token_id,
            //"http://stagingpepo.com",
            workflowDelegate);
            console.log("Workflow id ------>",workflowId);
        })
        .catch(err => console.log(err));
    }

    createSessionWorkflow(){
        let workflowDelegate =  new OstWorkflowDelegate();

          workflowDelegate.requestAcknowledged = (ostWorkflowContext , ostContextEntity) => {
              var object = {};
              var object2 = {};
              object2.ost_context_entity = ostContextEntity;
              object2.ost_workflow_context = ostWorkflowContext;
              object.root = object2;

              console.log("requestAcknowledged ---> ",object);
          };

          workflowDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
              var object = {};
              var object2 = {};
              object2.ost_context_entity = ostContextEntity;
              object2.ost_workflow_context = ostWorkflowContext;
              object.root = object2;

              console.log("flowComplete ---> ",object);
          };

          workflowDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
              var object = {};
              var object2 = {};
              object2.ost_context_entity = ostError;
              object2.ost_workflow_context = ostWorkflowContext;
              object.root = object2;

              console.log("flowInterrupt ---> ",object);
          };

          ostSetup.getCurrentUser()
          .then((currentUser) => {

            console.log("user_id =======> ",currentUser.user_id);
            let workflowId = OstSdkWallet.createSession(
              currentUser.user_id,
              10000000000,              //expirationTime
              "10000000000",              //spendingLimit
              //"http://stagingpepo.com",
              workflowDelegate);
              console.log("Workflow id ------>",workflowId);
          })
          .catch(err => console.log(err));

    }

    executeTransactionWorkflow(){
        let workflowDelegate =  new OstWorkflowDelegate();
        workflowDelegate.requestAcknowledged = (ostWorkflowContext , ostContextEntity) => {
            var object = {};
            var object2 = {};
            object2.ost_context_entity = ostContextEntity;
            object2.ost_workflow_context = ostWorkflowContext;
            object.root = object2;

            console.log("requestAcknowledged ---> ",object);
        };

        workflowDelegate.flowComplete = (ostWorkflowContext , ostContextEntity ) => {
            var object = {};
            var object2 = {};
            object2.ost_context_entity = ostContextEntity;
            object2.ost_workflow_context = ostWorkflowContext;
            object.root = object2;

            console.log("flowComplete ---> ",object);
        };

        workflowDelegate.flowInterrupt = (ostWorkflowContext , ostError) => {
            var object = {};
            var object2 = {};
            object2.ost_context_entity = ostError;
            object2.ost_workflow_context = ostWorkflowContext;
            object.root = object2;

            console.log("flowInterrupt ---> ",object);
        };

        const transactionData = {
            token_holder_addresses:  ['0x151111fc5a63f5a7f898395519c4c04071cd8ec5'],  //userTokenHolderAddresses,
            amounts: ['100'],
        };

        ostSetup.getCurrentUser()
        .then((currentUser) => {

          console.log("user_id =======> ",currentUser.user_id);
          let workflowId = OstSdkWallet.executePayTransaction(
            currentUser.user_id,
            transactionData,
            //"http://stagingpepo.com",
            workflowDelegate);
            console.log("Workflow id ------>",workflowId);
        })
        .catch(err => console.log(err));
    }
}

var workflow = new Workflows();
workflow.executeTransactionWorkflow();
