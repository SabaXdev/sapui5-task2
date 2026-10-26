sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "axalimoduli/model/models"
], (Controller, models) => {
    "use strict";

    return Controller.extend("axalimoduli.controller.Main", {
        onInit() {
            this.getView().setModel(models.createBooksModel());
        }
    });
});