import { Pressable, Text, TextInput, View } from "react-native";
import { tr } from "../../lib/i18n";
import { useLanguage } from "../../lib/language-context";
import type { AuxiliaryPanel } from "../../clinical-engine";
import { faixaDeEntradaDe } from "../../lib/faixas-de-entrada";
import { CategoricalSelector } from "../ui-v2/categorical-selector";
import { HorizontalMultiSelect } from "../ui-v2/horizontal-multi-select";
import { NumericStepper } from "../ui-v2/numeric-stepper";
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
  useLanguage(); // re-renderiza ao trocar o idioma (tr() reavalia)

  return (
    <View style={styles.auxiliaryPanelCard}>
      <Text style={styles.auxiliaryPanelTitle}>{tr(auxiliaryPanel.title)}</Text>
      {auxiliaryPanel.description ? (
        <Text style={styles.auxiliaryPanelDescription}>{tr(auxiliaryPanel.description)}</Text>
      ) : null}

      {fieldSections.map(([sectionTitle, fields]) => (
        <View key={sectionTitle} style={styles.auxiliarySectionCard}>
          <Text style={styles.auxiliarySectionTitle}>{tr(sectionTitle)}</Text>
          <View style={styles.auxiliaryFields}>
            {fields.map((field) => {
              const selectedPreset = field.presets?.find((preset) =>
                hasSelectedPresetValue(field.value, preset.value, field.presetMode)
              );
              const ehNumerico = field.keyboardType === "numeric";
              const faixa = ehNumerico ? faixaDeEntradaDe(field.id) : undefined;
              const numero = Number(String(field.value ?? "").replace(",", "."));
              const valorVisivel = String(field.value ?? "").trim().length > 0 && Number.isFinite(numero);

              return (
                <View
                  key={field.id}
                  style={[
                    styles.auxiliaryFieldGroup,
                    field.fullWidth ? styles.auxiliaryFieldGroupFullWidth : null,
                  ]}>
                  <Text style={styles.auxiliaryFieldLabel}>{tr(field.label)}</Text>
                  {faixa ? (
                    <NumericStepper
                      valor={valorVisivel ? numero : faixa.min}
                      valorVisivel={valorVisivel}
                      min={faixa.min}
                      max={faixa.max}
                      passo={faixa.passo}
                      unidade={field.unit || faixa.unidade || undefined}
                      onChange={(valor) => onFieldChange(field.id, String(valor).replace(".", ","))}
                      onConfirmar={(valor) => onFieldChange(field.id, String(valor).replace(".", ","))}
                      ajuda={field.helperText ? tr(field.helperText) : undefined}
                      testID={`slider-${field.id}`}
                    />
                  ) : ehNumerico ? (
                    <View
                      style={[
                        styles.auxiliaryRecommendationCard,
                        styles.auxiliaryRecommendationCardWarning,
                      ]}
                      accessibilityRole="alert">
                      <Text style={styles.auxiliaryRecommendationTitle}>
                        {tr("Campo numérico indisponível")}
                      </Text>
                      <Text style={styles.auxiliaryRecommendationLine}>
                        {tr("Faixa de entrada não configurada. Este campo não pode usar caixa de digitação como alternativa.")}
                      </Text>
                    </View>
                  ) : (
                    <TextInput
                      value={field.value}
                      placeholder={field.placeholder ? tr(field.placeholder) : undefined}
                      onChangeText={(text) => onFieldChange(field.id, text)}
                      style={styles.auxiliaryInput}
                      placeholderTextColor="#94a3b8"
                    />
                  )}
                  {field.unitOptions && field.unitOptions.length > 0 ? (
                    <CategoricalSelector
                      value={field.unit}
                      options={field.unitOptions.map((unitOption) => ({
                        value: unitOption.value,
                        label: tr(unitOption.label),
                      }))}
                      onChange={(value) => onUnitChange(field.id, value)}
                      testID={`unidade-${field.id}`}
                    />
                  ) : null}
                  {!faixa && field.helperText ? (
                    <Text style={styles.auxiliaryFieldHelper}>{tr(field.helperText)}</Text>
                  ) : null}
                  {field.presets && field.presets.length > 0 ? (
                    field.presetMode === "toggle_token" ? (
                      <HorizontalMultiSelect
                        options={field.presets.map((preset) => ({
                          value: preset.value,
                          label: tr(preset.label),
                          selected: hasSelectedPresetValue(
                            field.value,
                            preset.value,
                            field.presetMode
                          ),
                        }))}
                        onToggle={(value) => onPresetApply(field.id, value)}
                        accessibilityLabel={tr(field.label)}
                        testID={`preset-multiplo-${field.id}`}
                      />
                    ) : (
                      <CategoricalSelector
                        value={selectedPreset?.value}
                        options={field.presets.map((preset) => ({
                          value: preset.value,
                          label: tr(preset.label),
                        }))}
                        onChange={(value) => onPresetApply(field.id, value)}
                        testID={`preset-${field.id}`}
                      />
                    )
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ))}

      {auxiliaryPanel.metrics.length > 0 ? (
        <View style={styles.auxiliaryMetrics}>
          {auxiliaryPanel.metrics.map((metric) => (
            <View key={metric.label} style={styles.auxiliaryMetricItem}>
              <Text style={styles.auxiliaryMetricLabel}>{tr(metric.label)}</Text>
              <Text style={styles.auxiliaryMetricValue}>{tr(metric.value)}</Text>
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
              <Text style={styles.auxiliaryRecommendationTitle}>{tr(recommendation.title)}</Text>
              {recommendation.lines.map((line) => (
                <Text
                  key={`${recommendation.title}-${line}`}
                  style={styles.auxiliaryRecommendationLine}>
                  • {tr(line)}
                </Text>
              ))}
            </View>
          ))}
        </View>
      ) : null}

      {auxiliaryPanel.statusItems && auxiliaryPanel.statusItems.length > 0 ? (
        <View style={styles.auxiliaryStatusList}>
          {auxiliaryPanel.statusItems.map((item) => {
            const selectedOption = item.options.find(
              (option) => option.status === item.currentStatus
            );

            return (
              <View key={item.id} style={styles.auxiliaryStatusItem}>
                <View style={styles.auxiliaryStatusHeader}>
                  <Text style={styles.auxiliaryStatusLabel}>{tr(item.label)}</Text>
                  <Text style={styles.auxiliaryStatusValue}>{item.value}</Text>
                </View>
                {item.helperText ? (
                  <Text style={styles.auxiliaryFieldHelper}>{tr(item.helperText)}</Text>
                ) : null}
                <CategoricalSelector
                  value={selectedOption?.id}
                  options={item.options.map((option) => ({
                    value: option.id,
                    label: tr(option.label),
                    tone:
                      option.status === "pendente"
                        ? "warning"
                        : option.status === "solicitado"
                          ? "primary"
                          : "success",
                  }))}
                  onChange={(optionId) => {
                    const option = item.options.find((candidate) => candidate.id === optionId);
                    if (!option) return;
                    onStatusChange(item.id, option.status, option.requiresConfirmation);
                  }}
                  testID={`status-${item.id}`}
                />
              </View>
            );
          })}
        </View>
      ) : null}

      <View style={styles.auxiliaryActions}>
        {auxiliaryPanel.actions.map((action) => (
          <Pressable
            key={action.id}
            style={styles.auxiliaryActionButton}
            onPress={() => onActionRun(action.id, action.requiresConfirmation)}>
            <Text style={styles.auxiliaryActionButtonText}>{tr(action.label)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default AuxiliaryPanelCard;