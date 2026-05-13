
export const calculateOptionPrice = (optionGroups, selections) => {
    if (!optionGroups) return 0;
    let extra = 0;
    optionGroups.forEach((group, index) => {
        const sel = selections[index];
        const choices = Array.isArray(sel) ? sel : (sel ? [sel] : []);
        choices.forEach(name => {
            const choice = group.choices.find(c => (c.ChoiceName || c.name) === name);
            if (choice) {
                extra += Number(choice.ExtraPrice) || 0;
            }
        });
    });
    return extra;
};


export const getBasePrice = (menu) => {
    if (!menu) return 0;
    return Number(menu.PromoPrice) > 0 
        ? Number(menu.PromoPrice) 
        : Number(menu.Price);
};


export const buildOptionsNote = (optionGroups, selections) => {
    if (!optionGroups) return '';
    const lines = [];
    optionGroups.forEach((group, index) => {
        const sel = selections[index];
        const choices = Array.isArray(sel) ? sel : (sel ? [sel] : []);
        if (choices.length === 0) return;
        
        const strs = choices.map(name => {
            const choice = group.choices.find(c => (c.ChoiceName || c.name) === name);
            const price = choice ? Number(choice.ExtraPrice) || 0 : 0;
            return price > 0 ? `${name} (+฿${price})` : name;
        });
        lines.push(`${group.GroupName}: ${strs.join(', ')}`);
    });
    return lines.join('\n');
};
