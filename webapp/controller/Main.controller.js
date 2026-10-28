sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "axalimoduli/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], (BaseController, models, Filter, FilterOperator, JSONModel) => {
    "use strict";

    return BaseController.extend("axalimoduli.controller.Main", {
        onInit() {
            const oBooksModel = models.createBooksModel();
            this.getView().setModel(oBooksModel);
            this.getView().setModel(new JSONModel(this._createEmptyBook()), "newBook");
            this._initGenreFilterModel(oBooksModel);
        },

        _createEmptyBook() {
            return {
                ID: "",
                Name: "",
                Author: "",
                Genre: "",
                ReleaseDate: null,
                AvailableQuantity: ""
            };
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
            this._resetAddBookForm();

            const openDialog = (oDialog) => {
                oDialog.open();
            };

            if (this._oAddBookDialog) {
                openDialog(this._oAddBookDialog);
                return;
            }

            this.loadFragment({
                name: "axalimoduli.view.AddBookDialog"
            }).then((oDialog) => {
                this._oAddBookDialog = oDialog;
                openDialog(oDialog);
            });
        },

        onConfirmAddBook() {
            if (!this._validateAddBookForm()) {
                return;
            }

            const oNewBookModel = this.getView().getModel("newBook");
            const oModel = this.getBooksModel();
            const aBooks = oModel.getProperty("/books");

            aBooks.push({
                ID: oNewBookModel.getProperty("/ID").trim(),
                Name: oNewBookModel.getProperty("/Name").trim(),
                Author: oNewBookModel.getProperty("/Author").trim(),
                Genre: oNewBookModel.getProperty("/Genre").trim(),
                ReleaseDate: oNewBookModel.getProperty("/ReleaseDate"),
                AvailableQuantity: Number(oNewBookModel.getProperty("/AvailableQuantity"))
            });
            oModel.setProperty("/books", aBooks);
            this._initGenreFilterModel(oModel);
            this.onCancelAddBook();
        },

        onCancelAddBook() {
            this.byId("addBookDialog").close();
            this._resetAddBookForm();
        },

        _resetAddBookForm() {
            this.getView().getModel("newBook").setData(this._createEmptyBook());
            this._clearAddBookFieldValueStates();
        },

        _clearAddBookFieldValueStates() {
            [
                "addBookIdInput",
                "addBookNameInput",
                "addBookAuthorInput",
                "addBookGenreInput",
                "addBookReleaseDateInput",
                "addBookQuantityInput"
            ].forEach((sId) => {
                const oControl = this.byId(sId);
                if (oControl?.setValueState) {
                    oControl.setValueState("None");
                    oControl.setValueStateText("");
                }
            });
        },

        _validateAddBookForm() {
            const bIdValid = this._validateRequiredInput(this.byId("addBookIdInput"));
            const bNameValid = this._validateRequiredInput(this.byId("addBookNameInput"));
            const bAuthorValid = this._validateRequiredInput(this.byId("addBookAuthorInput"));
            const bGenreValid = this._validateRequiredInput(this.byId("addBookGenreInput"));
            const bDateValid = this._validateDatePicker(this.byId("addBookReleaseDateInput"));
            const bQuantityValid = this._validateQuantityInput(this.byId("addBookQuantityInput"));

            return bIdValid && bNameValid && bAuthorValid && bGenreValid && bDateValid && bQuantityValid;
        },

        _validateRequiredInput(oInput) {
            const sValue = oInput.getValue()?.trim() ?? "";
            const bValid = sValue.length > 0;

            oInput.setValueState(bValid ? "None" : "Error");
            oInput.setValueStateText(bValid ? "" : "This field is required");

            return bValid;
        },

        _validateDatePicker(oDatePicker) {
            const bValid = !!oDatePicker.getDateValue();

            oDatePicker.setValueState(bValid ? "None" : "Error");
            oDatePicker.setValueStateText(bValid ? "" : "Release date is required");

            return bValid;
        },

        _validateQuantityInput(oInput) {
            const sValue = oInput.getValue()?.trim() ?? "";

            if (!sValue.length) {
                oInput.setValueState("Error");
                oInput.setValueStateText("This field is required");
                return false;
            }

            const nQuantity = Number(sValue);

            if (!Number.isFinite(nQuantity) || nQuantity < 0) {
                oInput.setValueState("Error");
                oInput.setValueStateText("Enter a valid quantity");
                return false;
            }

            oInput.setValueState("None");
            oInput.setValueStateText("");
            return true;
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
        }
    });
});
