sap.ui.define([
    "axalimoduli/controller/Base.controller",
    "axalimoduli/model/models",
    "axalimoduli/model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], (BaseController, models, formatter, Filter, FilterOperator, JSONModel) => {
    "use strict";

    return BaseController.extend("axalimoduli.controller.Main", {
        formatter,
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
        }
    });
});
