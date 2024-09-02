// Note: Any fields defaulted to null are optional

export const v2CardPrototype = {
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: {
        name: "",
        description: "",
        personality: "",
        scenario: "",
        first_mes: "",
        mes_example: "",

        creator_notes: "",
        system_prompt: "",
        post_history_instructions: "",
        alternate_greetings: [""],
        character_book: undefined,//{},

        tags: [""],
        creator: "",
        character_version: "",
        extensions: {}
    }
};

export const v2CharacterBookPrototype = {
    name: undefined,//"",
    description: undefined,//"",
    scan_depth: undefined,//0,
    token_budget: undefined,//0,
    recursive_scanning: undefined,//false,
    extensions: {},
    entries: [{}]
};

export const v2CharacterBookEntryPrototype = {
    keys: [""],
    content: "",
    extensions: {},
    enabled: true,
    insertion_order: 0,
    case_sensitive: undefined,//false,

    // Not used in SillyTavern
    name: undefined, // Used for name in Chub, can be copied from comment or vice versa
    priority: undefined, // Used in Chub

    // Not used in AgnAI
    id: undefined,//0,
    comment: undefined, // Used for name in SillyTavern, can be copied from name or vice versa
    selective: undefined,//true,
    secondary_keys: undefined,//[""],
    constant: undefined,//false,
    position: undefined,//"before_char" or "after_char"
};