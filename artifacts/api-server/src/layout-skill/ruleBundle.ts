import * as constants   from "../rules/constants";
import * as units       from "../rules/units";
import * as formulas    from "../rules/formulas";
import * as validators  from "../rules/validators";
import * as stairRules  from "../rules/stairRules";
import * as roomRules   from "../rules/roomRules";
import * as siteRules   from "../rules/siteRules";
import * as qaRules     from "../rules/qaRules";
import { TOWNHOUSE_PRESET } from "../rules/presets/townhouse";
import { VILLA_PRESET }     from "../rules/presets/villa";
import { OFFICE_PRESET }    from "../rules/presets/office";

export interface LayoutRuleBundle {
  constants:  typeof constants;
  units:      typeof units;
  formulas:   typeof formulas;
  validators: typeof validators;
  stairRules: typeof stairRules;
  roomRules:  typeof roomRules;
  siteRules:  typeof siteRules;
  qaRules:    typeof qaRules;
  presets: {
    townhouse: typeof TOWNHOUSE_PRESET;
    villa:     typeof VILLA_PRESET;
    office:    typeof OFFICE_PRESET;
  };
}

/** Load all shared rules into one bundle. */
export function getLayoutRuleBundle(): LayoutRuleBundle {
  return {
    constants,
    units,
    formulas,
    validators,
    stairRules,
    roomRules,
    siteRules,
    qaRules,
    presets: {
      townhouse: TOWNHOUSE_PRESET,
      villa:     VILLA_PRESET,
      office:    OFFICE_PRESET,
    },
  };
}
