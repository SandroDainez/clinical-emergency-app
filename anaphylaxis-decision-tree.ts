import { DecisionTreeEngine, validateDecisionTree } from "./core/decision-tree/engine";
import type { DecisionTreeDefinition, FrontendTreeStep } from "./core/decision-tree/types";

export const anaphylaxisDecisionTree: DecisionTreeDefinition = {
  id: "anaphylaxis_v2",
  version: "1.0.0",
  label: "Anaphylaxis Decision Tree",
  entryNodeId: "diagnostic_entry",
  nodes: {
    diagnostic_entry: {
      id: "diagnostic_entry",
      type: "decision",
      title: "Diagnostic entry criteria",
      summary: "The protocol starts only when the presentation is clinically compatible with anaphylaxis.",
      question: "Does the patient meet anaphylaxis criteria or is suspicion high enough that treatment should not be delayed?",
      evidence: [
        "Sudden illness after likely exposure with airway, breathing or circulation compromise.",
        "Two or more systems involved after likely allergen exposure.",
        "Isolated hypotension after a known allergen can also qualify.",
      ],
      options: [
        { id: "criteria_met", label: "Yes — criteria met / suspicion high", next: "immediate_im_epinephrine" },
        { id: "criteria_not_met", label: "No — localized reaction only", next: "not_anaphylaxis_exit" },
      ],
    },

    immediate_im_epinephrine: {
      id: "immediate_im_epinephrine",
      type: "action",
      title: "Immediate first-line treatment",
      summary: "This block is mandatory and non-branching once anaphylaxis is recognized.",
      actions: [
        "Give intramuscular epinephrine immediately in the lateral thigh.",
        "Call for help and activate monitored resuscitation workflow.",
        "Place patient supine with legs elevated unless vomiting or severe respiratory distress requires another position.",
        "Start continuous pulse oximetry, blood pressure and cardiac monitoring.",
      ],
      next: "severity_stratification",
    },

    severity_stratification: {
      id: "severity_stratification",
      type: "decision",
      title: "Severity stratification",
      summary: "Separate moderate presentations from immediately life-threatening presentations.",
      question: "Is the patient severe right now?",
      evidence: [
        "Severe = shock, persistent hypotension, stridor, progressive upper-airway edema, severe bronchospasm, hypoxemia, cyanosis, exhaustion, or reduced consciousness.",
        "Moderate = anaphylaxis without shock or immediate airway failure.",
      ],
      options: [
        { id: "severe", label: "Severe / life-threatening", next: "severe_resuscitation_bundle" },
        { id: "moderate", label: "Moderate without shock/airway failure", next: "moderate_support_bundle" },
      ],
    },

    moderate_support_bundle: {
      id: "moderate_support_bundle",
      type: "action",
      title: "Moderate anaphylaxis support bundle",
      summary: "Supportive measures after the mandatory first IM epinephrine dose.",
      actions: [
        "Maintain oxygen supplementation if hypoxemic or respiratory symptoms are present.",
        "Secure IV access early and keep crystalloid available.",
        "Prepare a repeat IM epinephrine dose within 5 minutes if symptoms persist or worsen.",
        "Use inhaled bronchodilator only as adjunct for persistent bronchospasm after epinephrine.",
      ],
      next: "reassessment_after_first_im",
    },

    severe_resuscitation_bundle: {
      id: "severe_resuscitation_bundle",
      type: "action",
      title: "Severe anaphylaxis resuscitation bundle",
      summary: "High-acuity actions for severe anaphylaxis after the first IM epinephrine dose.",
      actions: [
        "Deliver high-flow oxygen immediately.",
        "Establish large-bore IV access and start rapid isotonic crystalloid bolus if hypotension or poor perfusion is present.",
        "Prepare airway equipment and experienced operator early if stridor, progressive edema or respiratory fatigue is present.",
        "Plan repeat IM epinephrine after 5 minutes if instability persists while resuscitation continues.",
      ],
      next: "reassessment_after_first_im",
    },

    reassessment_after_first_im: {
      id: "reassessment_after_first_im",
      type: "decision",
      title: "First reassessment loop",
      summary: "Reassess 5 minutes after the first IM epinephrine dose.",
      question: "What is the response after initial treatment?",
      evidence: [
        "Improving but symptomatic still requires continued observation and often a second IM dose.",
        "Persistent shock, severe airway compromise or worsening respiratory failure means escalation now.",
      ],
      options: [
        { id: "resolved_or_nearly_resolved", label: "Marked improvement / near resolution", next: "observation_phase" },
        { id: "persistent_non_severe", label: "Persistent symptoms without shock/airway failure", next: "repeat_im_epinephrine" },
        { id: "worsening_or_severe", label: "Worsening, shock, or airway threat", next: "critical_escalation_bundle" },
      ],
    },

    repeat_im_epinephrine: {
      id: "repeat_im_epinephrine",
      type: "action",
      title: "Second intramuscular epinephrine dose",
      summary: "Repeat IM epinephrine is still non-branching once this node is reached.",
      actions: [
        "Give a second IM epinephrine dose now.",
        "Continue monitoring, oxygen as needed, and IV access.",
        "Reassess blood pressure, respiratory effort, SpO₂, airway edema and mental status within 5 minutes.",
      ],
      next: "reassessment_after_second_im",
    },

    reassessment_after_second_im: {
      id: "reassessment_after_second_im",
      type: "decision",
      title: "Second reassessment loop",
      summary: "Decide whether the patient is stabilizing or requires advanced escalation.",
      question: "What is the response after the second IM epinephrine dose?",
      evidence: [
        "Failure of two IM doses plus fluids/support strongly raises the threshold for IV epinephrine and advanced support.",
        "Any airway deterioration remains a separate trigger for airway module handoff.",
      ],
      options: [
        { id: "now_stable", label: "Clearly improving / stabilized", next: "observation_phase" },
        { id: "persistent_instability", label: "Still unstable or refractory", next: "critical_escalation_bundle" },
      ],
    },

    critical_escalation_bundle: {
      id: "critical_escalation_bundle",
      type: "action",
      title: "Critical escalation bundle",
      summary: "Escalation for refractory shock, severe bronchospasm or progressive airway compromise.",
      actions: [
        "Start or prepare IV epinephrine infusion using institutional dosing protocol.",
        "Continue aggressive isotonic fluid resuscitation if hypotension persists.",
        "Escalate airway support immediately if upper-airway edema, respiratory fatigue or failure to oxygenate/ventilate is present.",
        "Move care toward ICU-level monitoring.",
      ],
      next: "post_escalation_decision",
    },

    post_escalation_decision: {
      id: "post_escalation_decision",
      type: "decision",
      title: "Post-escalation branching",
      summary: "Advanced support is already in place; choose the correct terminal pathway.",
      question: "Which escalation endpoint best describes the patient now?",
      evidence: [
        "IV epinephrine or refractory shock should not exit to routine observation.",
        "Terminal transitions are the only place where other modules may be referenced.",
      ],
      options: [
        { id: "airway_module_needed", label: "Advanced airway / RSI required", next: "transition_to_airway_module" },
        { id: "ventilation_module_needed", label: "Mechanical ventilation pathway required", next: "transition_to_ventilation_module" },
        { id: "vasoactive_module_needed", label: "Vasoactive infusion pathway required", next: "transition_to_vasoactive_module" },
        { id: "critical_but_self_contained", label: "Stabilized enough to remain in anaphylaxis pathway but needs ICU", next: "icu_transition" },
      ],
    },

    observation_phase: {
      id: "observation_phase",
      type: "action",
      title: "Observation and relapse surveillance",
      summary: "Observation remains mandatory even after clinical improvement.",
      actions: [
        "Continue monitored observation and reassess for recurrent respiratory, hemodynamic or mucocutaneous symptoms.",
        "Document trigger, timing, doses of epinephrine and response trajectory.",
        "Do not let antihistamines or steroids replace relapse surveillance or delayed escalation if symptoms recur.",
      ],
      next: "observation_disposition",
    },

    observation_disposition: {
      id: "observation_disposition",
      type: "decision",
      title: "Disposition after stabilization",
      summary: "Exit only after a terminal decision on safe discharge versus monitored admission.",
      question: "What is the safest disposition after observation?",
      evidence: [
        "Discharge requires sustained stability, no evolving airway/circulatory issue, and discharge preparedness.",
        "Need for repeated epinephrine, severe features, or persistent concern favors monitored admission or ICU.",
      ],
      options: [
        { id: "safe_discharge", label: "Safe for discharge with education and return precautions", next: "discharge_transition" },
        { id: "needs_monitored_observation", label: "Needs monitored observation / ward", next: "observation_transition" },
        { id: "needs_icu", label: "Needs ICU due to severity or relapse risk", next: "icu_transition" },
      ],
    },

    not_anaphylaxis_exit: {
      id: "not_anaphylaxis_exit",
      type: "transition",
      title: "Localized allergic reaction pathway",
      summary: "This branch exits the anaphylaxis protocol because systemic criteria were not met.",
      disposition: "other_module",
      exitCriteria: [
        "No systemic anaphylaxis criteria at this time.",
        "Localized reaction only, with explicit plan for reassessment if symptoms progress.",
      ],
      targets: [
        {
          moduleId: "allergic_reaction_observation",
          label: "Localized allergic reaction / observation",
          reason: "No current indication to remain inside the anaphylaxis decision tree.",
        },
      ],
    },

    discharge_transition: {
      id: "discharge_transition",
      type: "transition",
      title: "Safe discharge",
      summary: "Terminal discharge node for resolved anaphylaxis.",
      disposition: "discharge",
      exitCriteria: [
        "Symptoms resolved and hemodynamics stable.",
        "No active airway compromise or oxygen requirement.",
        "Patient/caregiver has discharge education, return precautions and epinephrine access when indicated.",
      ],
      targets: [
        {
          moduleId: "discharge_home",
          label: "Discharge home",
          reason: "Resolved anaphylaxis after observation with safe discharge criteria met.",
        },
      ],
    },

    observation_transition: {
      id: "observation_transition",
      type: "transition",
      title: "Monitored observation or ward admission",
      summary: "Terminal node for patients not ready for discharge but not requiring ICU-level support.",
      disposition: "observation",
      exitCriteria: [
        "Improved after treatment but still requires monitored observation.",
        "May have needed repeated IM epinephrine or still has residual symptoms needing follow-up.",
      ],
      targets: [
        {
          moduleId: "monitored_observation",
          label: "Observation / monitored bed",
          reason: "Needs further observation before final disposition.",
        },
      ],
    },

    icu_transition: {
      id: "icu_transition",
      type: "transition",
      title: "ICU admission",
      summary: "Terminal node for severe or relapsing anaphylaxis requiring intensive monitoring.",
      disposition: "icu",
      exitCriteria: [
        "Refractory or severe anaphylaxis.",
        "Need for vasopressor/IV epinephrine, advanced airway management, or ongoing critical monitoring.",
      ],
      targets: [
        {
          moduleId: "icu_admission",
          label: "ICU admission",
          reason: "Ongoing critical care requirement after severe anaphylaxis.",
        },
      ],
    },

    transition_to_airway_module: {
      id: "transition_to_airway_module",
      type: "transition",
      title: "Transition to airway module",
      summary: "Terminal handoff for definitive airway management.",
      disposition: "other_module",
      exitCriteria: [
        "Progressive upper-airway edema, failed oxygenation/ventilation, or immediate airway threat.",
        "Decision made for advanced airway sequence.",
      ],
      targets: [
        {
          moduleId: "isr_rapida",
          label: "Rapid sequence intubation module",
          reason: "Advanced airway management is now the primary workflow.",
        },
      ],
    },

    transition_to_ventilation_module: {
      id: "transition_to_ventilation_module",
      type: "transition",
      title: "Transition to ventilation module",
      summary: "Terminal handoff once invasive ventilation management becomes the main problem.",
      disposition: "other_module",
      exitCriteria: [
        "Mechanical ventilation is initiated or imminent.",
        "Ventilator setup and gas-exchange management are now the dominant workflow.",
      ],
      targets: [
        {
          moduleId: "ventilacao_mecanica",
          label: "Mechanical ventilation module",
          reason: "Requires ventilator setup and serial ventilatory management.",
        },
      ],
    },

    transition_to_vasoactive_module: {
      id: "transition_to_vasoactive_module",
      type: "transition",
      title: "Transition to vasoactive module",
      summary: "Terminal handoff once vasoactive infusion management becomes the main problem.",
      disposition: "other_module",
      exitCriteria: [
        "IV epinephrine or another vasoactive infusion is required and dosing titration becomes central.",
        "Refractory shock persists despite IM epinephrine, fluids and immediate resuscitation steps.",
      ],
      targets: [
        {
          moduleId: "drogas_vasoativas",
          label: "Vasoactive drugs module",
          reason: "Requires infusion-focused titration and vasoactive support workflow.",
        },
      ],
    },
  },
};

export const anaphylaxisDecisionTreeIssues = validateDecisionTree(anaphylaxisDecisionTree);

export function createAnaphylaxisDecisionEngine() {
  return new DecisionTreeEngine(anaphylaxisDecisionTree);
}

export function runSampleAnaphylaxisPath() {
  const engine = createAnaphylaxisDecisionEngine();

  const snapshots: Array<{
    label: string;
    step: FrontendTreeStep;
  }> = [];

  const capture = (label: string) => {
    snapshots.push({ label, step: engine.toFrontendStep() });
  };

  capture("Entry");
  engine.choose("criteria_met");
  capture("After diagnostic recognition");
  engine.advance();
  capture("After mandatory IM epinephrine");
  engine.choose("moderate");
  capture("After severity stratification");
  engine.advance();
  capture("After moderate support bundle");
  engine.choose("persistent_non_severe");
  capture("Persistent symptoms after first IM");
  engine.advance();
  capture("After second IM epinephrine");
  engine.choose("now_stable");
  capture("Stabilized after second IM");
  engine.advance();
  capture("Observation phase");
  engine.choose("safe_discharge");
  capture("Safe discharge terminal node");

  return {
    path: snapshots,
    log: engine.getLog(),
  };
}
