import { Pressable, Text, TextInput, View } from "react-native";
import type { AuxiliaryPanel } from "../../clinical-engine";
import { styles } from "./protocol-screen-styles";
import { hasSelectedPresetValue } from "./protocol-screen-utils";

type AuxiliaryPanelCardProps = {
  auxiliaryPanel: AuxiliaryPanel;
  fieldSections: [string, AuxiliaryPanel["fields"]][];
  onFieldChange: (fieldId: string, value: string) => void;
  onPresetApply: (fieldId: string, value: string) => void;
  onUnitChange: (fieldId: string, unit: string) => void;
  onActionRun: (actionId: string, requiresConfirmation?: boolean) => void;
  onStatusChange: (
    itemId: string,
    status: "pendente" | "solicitado" | "realizado",
    requiresConfirmation?: boolean
  ) => void;
};

function AuxiliaryPanelCard({
  auxiliaryPanel,
  fieldSections,
  onFieldChange,
  onPresetApply,
  onUnitChange,
  onActionRun,
  onStatusChange,
}: AuxiliaryPanelCardProps) {
  function resolveKeyboardType(keyboardType?: AuxiliaryPanel["fields"][number]["keyboardType"]) {
    return keyboardType === "numeric" ? "numbers-and-punctuation" : keyboardType;
  }

  return (
    <View style={styles.auxiliaryPanelCard}>
      <Text style={styles.auxiliaryPanelTitle}>{auxiliaryPanel.title}</Text>
      {auxiliaryPanel.description ? (
        <Text style={styles.auxiliaryPanelDescription}>{auxiliaryPanel.description}</Text>
      ) : null}

      {fieldSections.map(([sectionTitle, fields]) => (
        <View key={sectionTitle} style={styles.auxiliarySectionCard}>
          <Text style={styles.auxiliarySectionTitle}>{sectionTitle}</Text>
          <View style={styles.auxiliaryFields}>
            {fields.map((field) => (
              <View
                key={field.id}
                style={[
                  styles.auxiliaryFieldGroup,
                  field.fullWidth ? styles.auxiliaryFieldGroupFullWidth : null,
                ]}>
                <Text style={styles.auxiliaryFieldLabel}>{field.label}</Text>
                <TextInput
                  value={field.value}
                  placeholder={field.placeholder}
                  keyboardType={resolveKeyboardType(field.keyboardType)}
                  onChangeText={(text) => onFieldChange(field.id, text)}
                  style={styles.auxiliaryInput}
                  placeholderTextColor="#94a3b8"
                />
                {field.unitOptions && field.unitOptions.length > 0 ? (
                  <View style={styles.auxiliaryUnitRow}>
                    {field.unitOptions.map((unitOption) => (
                      <Pressable
                        key={`${field.id}-${unitOption.value}`}
                        style={[
                          styles.auxiliaryUnitButton,
                          field.unit === unitOption.value && styles.auxiliaryUnitButtonActive,
                        ]}
                        onPress={() => onUnitChange(field.id, unitOption.value)}>
                        <Text
                          style={[
                            styles.auxiliaryUnitButtonText,
                            field.unit === unitOption.value &&
                              styles.auxiliaryUnitButtonTextActive,
                          ]}>
                          {unitOption.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
                {field.helperText ? (
                  <Text style={styles.auxiliaryFieldHelper}>{field.helperText}</Text>
                ) : null}
                {field.presets && field.presets.length > 0 ? (
                  <View style={styles.auxiliaryPresetRow}>
                    {field.presets.map((preset) => {
                      const isSelected = hasSelectedPresetValue(
                        field.value,
                        preset.value,
                        field.presetMode
                      );

                      return (
                        <Pressable
                          key={`${field.id}-${preset.value}`}
                          style={[
                            styles.auxiliaryPresetButton,
                            isSelected && styles.auxiliaryPresetButtonActive,
                          ]}
                          onPress={() => onPresetApply(field.id, preset.value)}>
                          <Text
                            style={[
                              styles.auxiliaryPresetButtonText,
                              isSelected && styles.auxiliaryPresetButtonTextActive,
                            ]}>
                            {preset.label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        </View>
      ))}

      {auxiliaryPanel.metrics.length > 0 ? (
        <View style={styles.auxiliaryMetrics}>
          {auxiliaryPanel.metrics.map((metric) => (
            <View key={metric.label} style={styles.auxiliaryMetricItem}>
              <Text style={styles.auxiliaryMetricLabel}>{metric.label}</Text>
              <Text style={styles.auxiliaryMetricValue}>{metric.value}</Text>
            </View>
          ))}
        </View>
      ) : null}

      {auxiliaryPanel.recommendations && auxiliaryPanel.recommendations.length > 0 ? (
        <View style={styles.auxiliaryRecommendations}>
          {auxiliaryPanel.recommendations.map((recommendation) => (
            <View
              key={recommendation.title}
              style={[
                styles.auxiliaryRecommendationCard,
                recommendation.tone === "warning" && styles.auxiliaryRecommendationCardWarning,
              ]}>
              <Text style={styles.auxiliaryRecommendationTitle}>{recommendation.title}</Text>
              {recommendation.lines.map((line) => (
                <Text
                  key={`${recommendation.title}-${line}`}
                  style={styles.auxiliaryRecommendationLine}>
                  • {line}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {auxiliaryPanel.statusItems && auxiliaryPanel.statusItems.length > 0 ? (
        <View style={styles.auxiliaryStatusList}>
          {auxiliaryPanel.statusItems.map((item) => (
            <View key={item.id} style={styles.auxiliaryStatusItem}>
              <View style={styles.auxiliaryStatusHeader}>
                <Text style={styles.auxiliaryStatusLabel}>{item.label}</Text>
                <Text style={styles.auxiliaryStatusValue}>{item.value}</Text>
              </View>
              {item.helperText ? (
                <Text style={styles.auxiliaryFieldHelper}>{item.helperText}</Text>
              ) : null}
              <View style={styles.auxiliaryStatusButtons}>
                {item.options.map((option) => {
                  const isSelected = item.currentStatus === option.status;

                  return (
                    <Pressable
                      key={`${item.id}-${option.id}`}
                      style={[
                        styles.auxiliaryStatusButton,
                        option.status === "pendente" && styles.auxiliaryStatusPending,
                        option.status === "solicitado" && styles.auxiliaryStatusRequested,
                        option.status === "realizado" && styles.auxiliaryStatusDone,
                        isSelected && styles.auxiliaryStatusSelected,
                        isSelected &&
                          option.status === "pendente" &&
                          styles.auxiliaryStatusPendingSelected,
                        isSelected &&
                          option.status === "solicitado" &&
                          styles.auxiliaryStatusRequestedSelected,
                        isSelected &&
                          option.status === "realizado" &&
                          styles.auxiliaryStatusDoneSelected,
                      ]}
                      onPress={() =>
                        onStatusChange(item.id, option.status, option.requiresConfirmation)
                      }>
                      <Text
                        style={[
                          styles.auxiliaryStatusButtonText,
                          isSelected && styles.auxiliaryStatusButtonTextSelected,
                        ]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.auxiliaryActions}>
        {auxiliaryPanel.actions.map((action) => (
          <Pressable
            key={action.id}
            style={styles.auxiliaryActionButton}
            onPress={() => onActionRun(action.id, action.requiresConfirmation)}>
            <Text style={styles.auxiliaryActionButtonText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default AuxiliaryPanelCard;
