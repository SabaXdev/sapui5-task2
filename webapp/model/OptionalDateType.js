sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/model/SimpleType"
], (DateFormat, SimpleType) => {
    "use strict";

    return SimpleType.extend("axalimoduli.model.OptionalDateType", {
        formatValue(vValue) {
            if (vValue == null || vValue === "") {
                return "";
            }

            const oDate = vValue instanceof Date ? vValue : new Date(vValue);
            if (Number.isNaN(oDate.getTime())) {
                return "";
            }

            return DateFormat.getDateInstance({
                style: "medium",
                UTC: true
            }).format(oDate);
        },

        parseValue(vValue) {
            return vValue;
        },

        validateValue() {}
    });
});
