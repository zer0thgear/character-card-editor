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
        character_book: undefined,//{},
        
        // New V3 fields
        assets: undefined,
        nickname: undefined,
        creator_notes_multilingual: undefined,
        source: undefined,
        group_only_greetings: [],
        creation_date: undefined,
        modification_date: undefined
    }
};

export const v3CharacterBookPrototype = {
    name: undefined,//"",
    description: undefined,//"",
    scan_depth: undefined,//0,
    token_budget: undefined,//0,
    recursive_scanning: undefined,//false,
    extensions: {},
    entries: []
};

export const v3CharacterBookEntryPrototype = {
    keys: [""],
    content: "",
    extensions: {},
    enabled: true,
    insertion_order: 0,
    case_sensitive: undefined,//false,

    // V3 addition
    use_regex: false,
    // Now required in V3
    constant: undefined, // Boolean 
    
    // Optional fields
    name: undefined, // Used for name in Chub, can be copied from comment or vice versa
    priority: undefined,//0,
    id: undefined,//0,
    comment: undefined, // Used for name in SillyTavern, can be copied from name or vice versa

    selective: undefined,//true,
    secondary_keys: undefined,//[""],
    position: undefined,//"before_char" or "after_char"
};

export const v3AssetPrototype = {
    type: "",
    uri: "",
    name: "",
    ext: "",
};