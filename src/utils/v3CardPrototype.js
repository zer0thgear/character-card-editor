// Note: Any fields defaulted to null are optional

export const v3CardPrototype = {
    spec: "chara_card_v3",
    spec_version: "3.0",
    data: {
        name: "",
        description: "",
        tags: [""],
        creator: "",
        character_version: "",
        mes_example: "",
        extensions: {},
        system_prompt: "",
        post_history_instructions: "",
        first_mes: "",
        alternate_greetings: [""],
        personality: "",
        scenario: "",

        creator_notes: "",
        character_book: null,//{},
        
        // New V3 fields
        assets: undefined,
        nickname: null,
        creator_notes_multilingual: null,
        source: null,
        group_only_greetings: [],
        creation_date: null,
        modification_date: null
    }
};

export const v3CharacterBookPrototype = {
    name: null,//"",
    description: null,//"",
    scan_depth: null,//0,
    token_budget: null,//0,
    recursive_scanning: null,//false,
    extensions: {},
    entries: [{}]
};

export const v3CharacterBookEntryPrototype = {
    keys: [""],
    content: "",
    extensions: {},
    enabled: true,
    insertion_order: 0,
    case_sensitive: null,//false,

    // V3 addition
    use_regex: false,
    // Now required in V3
    constant: false, 
    
    // Optional fields
    name: null, // Used for name in Chub, can be copied from comment or vice versa
    priority: null,//0,
    id: null,//0,
    comment: null, // Used for name in SillyTavern, can be copied from name or vice versa

    selective: null,//true,
    secondary_keys: null,//[""],
    position: null,//"before_char" or "after_char"
};

export const v3AssetPrototype = {
    type: "",
    uri: "",
    name: "",
    ext: "",
};