/**
 * Utility functions for menu price calculations and note generation.
 */

/**
 * Calculates the total extra price from selected options.
 * @param {Array} optionGroups - The menu's option groups.
 * @param {Object} selections - The user's selections.
 * @returns {number} The total extra price.
 */
export const calculateOptionPrice = (optionGroups, selections) => {
    if (!optionGroups) return 0;
    let extra = 0;
    optionGroups.forEach((group, index) => {
        const sel = selections[index];
        const choices = Array.isArray(sel) ? sel : (sel ? [sel] : []);
        choices.forEach(name => {
            const choice = group.choices.find(c => c.name === name);
            if (choice) {
                extra += Number(choice.price) || 0;
            }
        });
    });
    return extra;
};

/**
 * Gets the base price of a menu item, accounting for promotions.
 * @param {Object} menu - The menu item object.
 * @returns {number} The base price.
 */
export const getBasePrice = (menu) => {
    if (!menu) return 0;
    return Number(menu.PromoPrice) > 0 
        ? Number(menu.PromoPrice) 
        : Number(menu.Price);
};

/**
 * Builds a summary note of the selected options.
 * @param {Array} optionGroups - The menu's option groups.
 * @param {Object} selections - The user's selections.
 * @returns {string} The formatted options note.
 */
export const buildOptionsNote = (optionGroups, selections) => {
    if (!optionGroups) return '';
    const lines = [];
    optionGroups.forEach((group, index) => {
        const sel = selections[index];
        const choices = Array.isArray(sel) ? sel : (sel ? [sel] : []);
        if (choices.length === 0) return;
        
        const strs = choices.map(name => {
            const choice = group.choices.find(c => c.name === name);
            const price = choice ? Number(choice.price) || 0 : 0;
            return price > 0 ? `${name} (+฿${price})` : name;
        });
        lines.push(`${group.name}: ${strs.join(', ')}`);
    });
    return lines.join('\n');
};
