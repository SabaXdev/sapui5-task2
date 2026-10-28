sap.ui.define([], () => {
    "use strict";

    return {
        /**
         * Formats a release date as "Published: {Year}" using the i18n label pattern.
         * @param {Date|string} vReleaseDate Book release date.
         * @param {string} sPublishedLabel i18n text containing a {0} year placeholder.
         * @returns {string} Formatted published year or empty string.
         */
        formatPublishedYear(vReleaseDate, sPublishedLabel) {
            if (!vReleaseDate || !sPublishedLabel) {
                return "";
            }

            const oReleaseDate = vReleaseDate instanceof Date ? vReleaseDate : new Date(vReleaseDate);

            if (Number.isNaN(oReleaseDate.getTime())) {
                return "";
            }

            return sPublishedLabel.replace("{0}", String(oReleaseDate.getFullYear()));
        }
    };
});
