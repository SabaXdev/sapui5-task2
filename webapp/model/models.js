sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device"
], 
function (JSONModel, Device) {
    "use strict";

    return {
        /**
         * Provides runtime information for the device the UI5 app is running on as a JSONModel.
         * @returns {sap.ui.model.json.JSONModel} The device model.
         */
        createDeviceModel: function () {
            var oModel = new JSONModel(Device);
            oModel.setDefaultBindingMode("OneWay");
            return oModel;
        },

        /**
         * Book catalog used by the main view.
         * @returns {sap.ui.model.json.JSONModel} The books model.
         */
        createBooksModel: function () {
            return new JSONModel({
                books: [
                    {
                        ID: "B001",
                        Name: "The Hobbit",
                        Author: "J.R.R. Tolkien",
                        Genre: "Fantasy",
                        ReleaseDate: new Date(1937, 8, 21),
                        AvailableQuantity: 8
                    },
                    {
                        ID: "B002",
                        Name: "1984",
                        Author: "George Orwell",
                        Genre: "Dystopian",
                        ReleaseDate: new Date(1949, 5, 8),
                        AvailableQuantity: 5
                    },
                    {
                        ID: "B003",
                        Name: "To Kill a Mockingbird",
                        Author: "Harper Lee",
                        Genre: "Fiction",
                        ReleaseDate: new Date(1960, 6, 11),
                        AvailableQuantity: 3
                    },
                    {
                        ID: "B004",
                        Name: "The Pragmatic Programmer",
                        Author: "Andrew Hunt",
                        Genre: "Technology",
                        ReleaseDate: new Date(1999, 9, 20),
                        AvailableQuantity: 15
                    },
                    {
                        ID: "B005",
                        Name: "Sapiens",
                        Author: "Yuval Noah Harari",
                        Genre: "History",
                        ReleaseDate: new Date(2011, 0, 1),
                        AvailableQuantity: 7
                    },
                    {
                        ID: "B006",
                        Name: "Clean Code",
                        Author: "Robert C. Martin",
                        Genre: "Technology",
                        ReleaseDate: new Date(2008, 7, 1),
                        AvailableQuantity: 12
                    }
                ]
            });
        }
    };

});