sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "axalimoduli/model/models",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], (BaseController, models, MessageBox, MessageToast, Fragment, ValueState, Filter, FilterOperator, JSONModel) => {
    "use strict";

    return BaseController.extend("axalimoduli.controller.Main", {
        onInit() {
            const oBooksModel = models.createBooksModel();
            this.getView().setModel(oBooksModel);
            this._initGenreFilterModel(oBooksModel);
        },

        _initGenreFilterModel(oBooksModel) {
            const aGenres = [...new Set(oBooksModel.getProperty("/books").map((oBook) => oBook.Genre))]
                .sort();
            this.getView().setModel(new JSONModel({ genres: aGenres }), "filter");
        },

        onFilterBooks() {
            const sTitle = this.byId("titleFilter").getValue();
            const sGenre = this.byId("genreFilter").getSelectedKey();
            const aFilters = [];

            if (sTitle) {
                aFilters.push(new Filter("Name", FilterOperator.Contains, sTitle));
            }
            if (sGenre) {
                aFilters.push(new Filter("Genre", FilterOperator.EQ, sGenre));
            }

            this.byId("booksTable").getBinding("items").filter(aFilters);
        },

        onAddRecord() {
            const oModel = this.getBooksModel();
            const aBooks = oModel.getProperty("/books");

            aBooks.push({
                ID: "",
                Name: "",
                Author: "",
                Genre: "",
                ReleaseDate: null,
                AvailableQuantity: 0
            });
            oModel.setProperty("/books", aBooks);
        },

        onDeleteRecord() {
            const oTable = this.byId("booksTable");
            const aSelectedContexts = oTable.getSelectedContexts();

            if (!aSelectedContexts.length) {
                return;
            }

            const oModel = this.getBooksModel();
            const aBooks = oModel.getProperty("/books");
            const aSelectedBooks = new Set(aSelectedContexts.map((oContext) => oContext.getObject()));
            const aRemainingBooks = aBooks.filter((oBook) => !aSelectedBooks.has(oBook));

            oModel.setProperty("/books", aRemainingBooks);
            oTable.removeSelections(true);
        },

        _getAddProductV2FieldConfig() {
            return [
                { controlId: "addProductV2Id", required: true },
                { controlId: "addProductV2Name", required: true },
                { controlId: "addProductV2Description", required: true },
                { controlId: "addProductV2ReleaseDate", required: true },
                { controlId: "addProductV2DiscontinuedDate", required: true },
                { controlId: "addProductV2Rating", required: true },
                { controlId: "addProductV2Price", required: true }
            ];
        },

        _isAddProductV2FieldEmpty(oControl) {
            if (oControl.isA("sap.m.DatePicker")) {
                return !oControl.getDateValue();
            }

            const vValue = oControl.getValue();
            return vValue === undefined || vValue === null || String(vValue).trim() === "";
        },

        _setAddProductV2FieldValueState(oControl, bValid, sRequiredText) {
            if (bValid) {
                oControl.setValueState(ValueState.None);
                oControl.setValueStateText("");
                return;
            }

            oControl.setValueState(ValueState.Error);
            oControl.setValueStateText(sRequiredText);
        },

        _clearAddProductV2ValueStates() {
            this._getAddProductV2FieldConfig().forEach(({ controlId }) => {
                const oControl = this.byId(controlId);
                if (oControl) {
                    this._setAddProductV2FieldValueState(oControl, true);
                }
            });
        },

        _validateAddProductV2Form() {
            const sRequiredText = this.getView().getModel("i18n").getResourceBundle()
                .getText("addProductFieldRequired");
            let bValid = true;

            this._getAddProductV2FieldConfig().forEach(({ controlId, required }) => {
                const oControl = this.byId(controlId);
                if (!oControl) {
                    return;
                }

                const bFieldValid = !required || !this._isAddProductV2FieldEmpty(oControl);
                this._setAddProductV2FieldValueState(oControl, bFieldValid, sRequiredText);
                if (!bFieldValid) {
                    bValid = false;
                }
            });

            return bValid;
        },

        _resetAddProductV2Model() {
            this.getView().setModel(new JSONModel({
                ID: "",
                Name: "",
                Description: "",
                ReleaseDate: "",
                DiscontinuedDate: "",
                Rating: "",
                Price: ""
            }), "addProductV2");
        },

        _openAddProductV2Dialog() {
            this._resetAddProductV2Model();
            this._clearAddProductV2ValueStates();
            this._oAddProductDialog.open();
        },

        onAddRecordProductsV2() {
            if (this._oAddProductDialog) {
                this._openAddProductV2Dialog();
                return;
            }

            Fragment.load({
                id: this.getView().getId(),
                name: "axalimoduli.view.fragment.AddProductV2Dialog",
                controller: this
            }).then((oDialog) => {
                this._oAddProductDialog = oDialog;
                this.getView().addDependent(oDialog);
                this._openAddProductV2Dialog();
            });
        },

        onAddProductV2FieldChange(oEvent) {
            const oControl = oEvent.getSource();
            if (!this._isAddProductV2FieldEmpty(oControl)) {
                this._setAddProductV2FieldValueState(oControl, true);
            }
        },

        onSaveProductV2() {
            if (!this._validateAddProductV2Form()) {
                return;
            }

            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const oModel = this.getView().getModel("oDataV2Model");
            const oReleaseDate = this.byId("addProductV2ReleaseDate").getDateValue();
            const oDiscontinuedDate = this.byId("addProductV2DiscontinuedDate").getDateValue();
            const oProduct = {
                ID: parseInt(this.byId("addProductV2Id").getValue(), 10),
                Name: this.byId("addProductV2Name").getValue().trim(),
                Description: this.byId("addProductV2Description").getValue().trim(),
                ReleaseDate: oReleaseDate,
                DiscontinuedDate: oDiscontinuedDate,
                Rating: parseInt(this.byId("addProductV2Rating").getValue(), 10),
                Price: this.byId("addProductV2Price").getValue().trim()
            };

            oModel.create("/Products", oProduct, {
                success: () => {
                    this._oAddProductDialog.close();
                    MessageToast.show(oResourceBundle.getText("createProductsSuccess"));
                },
                error: (oError) => {
                    const sMessage = oError?.message || oResourceBundle.getText("createProductsFailed");
                    MessageBox.error(sMessage);
                }
            });
        },

        onCancelAddProductV2() {
            this._oAddProductDialog.close();
        },

        onDeleteProductsV2() {
            const oTable = this.byId("productsV2Table");
            const aSelectedContexts = oTable.getSelectedContexts();
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();

            if (!aSelectedContexts.length) {
                return;
            }

            const oModel = this.getView().getModel("oDataV2Model");
            const sDeleteGroupId = "deleteProductsGroup";
            const iCount = aSelectedContexts.length;

            oModel.setDeferredGroups([sDeleteGroupId]);

            aSelectedContexts.forEach((oContext) => {
                oModel.remove(oContext.getPath(), { groupId: sDeleteGroupId });
            });

            oModel.submitChanges({
                groupId: sDeleteGroupId,
                success: () => {
                    MessageToast.show(oResourceBundle.getText("deleteProductsSuccess", [iCount]));
                    oTable.removeSelections(true);
                },
                error: (oError) => {
                    oModel.resetChanges([sDeleteGroupId]);
                    const sMessage = oError?.message || oResourceBundle.getText("deleteProductsFailed");
                    MessageBox.error(sMessage);
                }
            });
        }
    });
});
