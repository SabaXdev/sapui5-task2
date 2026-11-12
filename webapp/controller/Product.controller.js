sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "sap/ui/core/routing/History"
], (BaseController, History) => {
    "use strict";

    return BaseController.extend("axalimoduli.controller.Product", {
        onInit() {
            this.getView().setModel(this.getOwnerComponent().getModel("oDataV2Model"));

            this._oRouter = this.getOwnerComponent().getRouter();
            this._oProductRoute = this._oRouter.getRoute("RouteProduct");
            this._oProductRoute.attachPatternMatched(this._onRouteMatched, this);
        },

        onExit() {
            this._oProductRoute.detachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched(oEvent) {
            const sProductId = oEvent.getParameter("arguments").ProductID;

            this.getView().bindElement({
                path: `/Products(${sProductId})`,
                parameters: {
                    expand: "Supplier"
                }
            });
        },

        onNavBack() {
            const sPreviousHash = History.getInstance().getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
                return;
            }

            this._oRouter.navTo("RouteMainTab", {
                tabKey: "odataV2"
            }, true);
        }
    });
});
