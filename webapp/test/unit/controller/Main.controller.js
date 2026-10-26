/*global QUnit*/

sap.ui.define([
	"axalimoduli/controller/Main.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Main Controller");

	QUnit.test("I should test the Main controller", function (assert) {
		var oAppController = new Controller();
		var oModel;

		oAppController.getView = function () {
			return {
				setModel: function (oSetModel) {
					oModel = oSetModel;
				}
			};
		};

		oAppController.onInit();

		assert.ok(oAppController, "Controller instance is created");
		assert.ok(oModel, "Books JSON model is set on the view in onInit");
		assert.ok(oModel.getProperty("/books").length >= 5, "Model contains at least 5 books");
	});

});
