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
        character_book: null,//{},

        tags: [""],
        creator: "",
        character_version: "",
        extensions: {}
    }
};

export const v2CharacterBookPrototype = {
    name: null,//"",
    description: null,//"",
    scan_depth: null,//0,
    token_budget: null,//0,
    recursive_scanning: null,//false,
    extensions: {},
    entries: [{}]
};

export const v2CharacterBookEntryPrototype = {
    keys: [""],
    content: "",
    extensions: {},
    enabled: true,
    insertion_order: 0,
    case_sensitive: null,//false,

    // Not used in SillyTavern
    name: null, // Used for name in Chub, can be copied from comment or vice versa
    priority: null, // Used in Chub

    // Not used in AgnAI
    id: null,//0,
    comment: null, // Used for name in SillyTavern, can be copied from name or vice versa
    selective: null,//true,
    secondary_keys: null,//[""],
    constant: null,//false,
    position: null,//"before_char" or "after_char"
};