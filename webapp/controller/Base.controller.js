sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("axalimoduli.controller.Base", {
        /**
         * Returns the default JSON model (books catalog) bound to the view.
         * @returns {sap.ui.model.json.JSONModel} The books model.
         */
        getBooksModel() {
            return this.getView().getModel();
        }
    });
});
