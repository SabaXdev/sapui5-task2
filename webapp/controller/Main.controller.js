sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "axalimoduli/model/models",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment",
    "sap/ui/core/ValueState",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat"
], (BaseController, models, MessageBox, MessageToast, Fragment, ValueState, Filter, FilterOperator, Sorter, JSONModel, DateFormat) => {
    "use strict";

    return BaseController.extend("axalimoduli.controller.Main", {
        onInit() {
            const oBooksModel = models.createBooksModel();
            this.getView().setModel(oBooksModel);
            this._initGenreFilterModel(oBooksModel);
            this._initBooksSortComboBox();
        },

        _initBooksSortComboBox() {
            const oTable = this.byId("booksTable");
            const aColumns = oTable.getColumns().reduce((aResult, oColumn) => {
                const oSortProperty = oColumn.getCustomData().find((oData) => oData.getKey() === "sortProperty");
                if (!oSortProperty) {
                    return aResult;
                }

                const oHeader = oColumn.getHeader();
                aResult.push({
                    key: oSortProperty.getValue(),
                    text: oHeader && oHeader.getText ? oHeader.getText() : oSortProperty.getValue()
                });
                return aResult;
            }, []);

            this.getView().setModel(new JSONModel({ columns: aColumns }), "sort");
        },

        onBooksSortColumnChange(oEvent) {
            const sProperty = oEvent.getSource().getSelectedKey();
            if (!sProperty) {
                return;
            }

            this.byId("booksTable").getBinding("items").sort(new Sorter(sProperty, true));
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

        onFilterProductsV2() {
            const sProductName = this.byId("productNameFilterV2").getValue();
            const aFilters = [];

            if (sProductName) {
                aFilters.push(new Filter("Name", FilterOperator.Contains, sProductName));
            }

            this.byId("productsV2Table").getBinding("items").filter(aFilters);
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

        _formatProductDateForPicker(vDate) {
            if (!vDate) {
                return "";
            }

            const oDate = vDate instanceof Date ? vDate : new Date(vDate);
            return DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" }).format(oDate);
        },

        _populateAddProductV2ModelFromProduct(oProduct) {
            this.getView().setModel(new JSONModel({
                ID: String(oProduct.ID ?? ""),
                Name: oProduct.Name ?? "",
                Description: oProduct.Description ?? "",
                ReleaseDate: this._formatProductDateForPicker(oProduct.ReleaseDate),
                DiscontinuedDate: this._formatProductDateForPicker(oProduct.DiscontinuedDate),
                Rating: oProduct.Rating !== undefined && oProduct.Rating !== null ? String(oProduct.Rating) : "",
                Price: oProduct.Price !== undefined && oProduct.Price !== null ? String(oProduct.Price) : ""
            }), "addProductV2");
        },

        _setAddProductV2DialogMode(sMode) {
            const oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            const sTitleKey = sMode === "edit" ? "editProductDialogTitle" : "addProductDialogTitle";

            this._sProductV2DialogMode = sMode;
            this._oAddProductDialog.setTitle(oResourceBundle.getText(sTitleKey));

            const oIdField = this.byId("addProductV2Id");
            if (oIdField) {
                oIdField.setEditable(sMode !== "edit");
            }
        },

        _openAddProductV2Dialog() {
            this._resetAddProductV2Model();
            this._setAddProductV2DialogMode("create");
            this._sEditProductPath = null;
            this._clearAddProductV2ValueStates();
            this._oAddProductDialog.open();
        },

        _openEditProductV2Dialog(oProduct, sPath) {
            this._populateAddProductV2ModelFromProduct(oProduct);
            this._setAddProductV2DialogMode("edit");
            this._sEditProductPath = sPath;
            this._clearAddProductV2ValueStates();
            this._oAddProductDialog.open();
        },

        _ensureAddProductV2Dialog(fnOpen) {
            if (this._oAddProductDialog) {
                fnOpen();
                return;
            }

            Fragment.load({
                id: this.getView().getId(),
                name: "axalimoduli.view.fragment.AddProductV2Dialog",
                controller: this
            }).then((oDialog) => {
                this._oAddProductDialog = oDialog;
                this.getView().addDependent(oDialog);
                fnOpen();
            });
        },

        onAddRecordProductsV2() {
            this._ensureAddProductV2Dialog(() => this._openAddProductV2Dialog());
        },

        onEditProductV2(oEvent) {
            const oContext = oEvent.getSource().getBindingContext("oDataV2Model");
            if (!oContext) {
                return;
            }

            const oProduct = oContext.getObject();
            const sPath = oContext.getPath();

            this._ensureAddProductV2Dialog(() => this._openEditProductV2Dialog(oProduct, sPath));
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

            const fnCloseAndToast = (sSuccessKey) => {
                this._oAddProductDialog.close();
                MessageToast.show(oResourceBundle.getText(sSuccessKey));
            };

            const fnShowError = (oError, sFailedKey) => {
                const sMessage = oError?.message || oResourceBundle.getText(sFailedKey);
                MessageBox.error(sMessage);
            };

            if (this._sProductV2DialogMode === "edit") {
                oModel.update(this._sEditProductPath, oProduct, {
                    success: () => fnCloseAndToast("updateProductsSuccess"),
                    error: (oError) => fnShowError(oError, "updateProductsFailed")
                });
                return;
            }

            oModel.create("/Products", oProduct, {
                success: () => fnCloseAndToast("createProductsSuccess"),
                error: (oError) => fnShowError(oError, "createProductsFailed")
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
