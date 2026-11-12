sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "sap/ui/core/routing/History"
], (BaseController, History) => {
    "use strict";

    return BaseController.extend("axalimoduli.controller.Product", {
        onInit() {
            this.getOwnerComponent().getRouter()
                .getRoute("RouteProduct")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched(oEvent) {
            this._sProductId = oEvent.getParameter("arguments").ProductID;
        },

        onNavBack() {
            const sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
                return;
            }

            this.getOwnerComponent().getRouter().navTo("RouteMainTab", {
                tabKey: "odataV2"
            }, true);
        }
    });
});
