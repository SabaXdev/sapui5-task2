sap.ui.define([
    "sap/ui/core/util/MockServer"
], (MockServer) => {
    "use strict";

    const V2_ROOT_URI = "/odata/V2/ODataDemo/";
    const V4_ROOT_URI = "/odata/V4/ODataDemo/";

    let bStarted = false;

    /**
     * Starts client-side OData V2 mock server (fallback when UI5 tooling middleware is not used).
     * OData V4 is served by @sap-ux/ui5-middleware-fe-mockserver in ui5.yaml / ui5-local.yaml.
     */
    function init() {
        if (bStarted) {
            return;
        }

        const oMockServer = new MockServer({ rootUri: V2_ROOT_URI });
        oMockServer.simulate("localService/metadataV2.xml", {
            sMockdataBaseUrl: "localService/mockdataV2/",
            bGenerateMissingMockData: true
        });
        oMockServer.start();
        bStarted = true;

        // eslint-disable-next-line no-console
        console.info(
            "[axalimoduli] OData V2 MockServer started at",
            V2_ROOT_URI,
            "(V4 mock: use npm start / sap-fe-mockserver middleware at",
            V4_ROOT_URI + ")"
        );
    }

    return {
        init,
        V2_ROOT_URI,
        V4_ROOT_URI
    };
});
