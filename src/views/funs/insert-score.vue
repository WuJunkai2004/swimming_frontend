<script setup>
import { ref, watch, onMounted } from "vue";
import { useToken } from "#/useToken";
import { useAlert } from "#/useAlert";
import { useFoulEnum } from "#/foulMapping";
import { getData } from "#/useStorage";
import { funVolunteerApi } from "@/api/serve.js";

const props = defineProps(["currentEvent"]);

const { getToken } = useToken();
const { alerts } = useAlert();
const foulState = useFoulEnum();

const road = ref(getData("road") || "");
const rawScore = ref("");
const isValid = ref(true);
const invalidType = ref("");
const invalidReason = ref("");
const submitting = ref(false);

const foulOptions = ref([]);

const resetForm = () => {
  rawScore.value = "";
  isValid.value = true;
  invalidType.value = "";
  invalidReason.value = "";
};

watch(() => props.currentEvent, resetForm);

const submitData = async () => {
  console.log("提交成绩", {
    eventId: props.currentEvent?.eventId,
    road: road.value,
    rawScore: rawScore.value,
    isValid: isValid.value,
    invalidType: invalidType.value,
    invalidReason: invalidReason.value,
  });
  if (!props.currentEvent) {
    alerts("警告", "请先选择比赛项目");
    return;
  }

  if (!road.value || isNaN(Number(road.value))) {
    alerts("警告", "请输入有效的道次");
    return;
  }

  if (!rawScore.value) {
    alerts("警告", "请输入成绩");
    return;
  }

  submitting.value = true;

  const payload = {
    token: getToken(),
    eventId: props.currentEvent.eventId,
    road: Number(road.value),
    round: props.currentEvent.round || 1,
    rawScore: Number(rawScore.value),
    isValid: isValid.value,
  };

  if (!isValid.value) {
    payload.invalidType = invalidType.value || undefined;
    payload.invalidReason = invalidReason.value || undefined;
  }

  funVolunteerApi
    .uploadResult(payload)
    .then((res) => res.json())
    .then((data) => {
      if (data.statusCode === 200) {
        alerts("成功", `第 ${road.value} 道成绩提交成功`);
        resetForm();
      } else {
        alerts("失败", data.message || "提交失败");
      }
    })
    .catch((e) => {
      console.error(e);
      alerts("错误", "网络异常，提交出错");
    })
    .finally(() => {
      submitting.value = false;
    });
};

defineExpose({ submit: submitData });

onMounted(() => {
  foulOptions.value = Object.entries(foulState.foulMap).map(
    ([value, label]) => ({
      label,
      value,
    }),
  );
});
</script>

<template>
  <div class="p-4">
    <Card>
      <template #title>成绩录入</template>
      <template #content>
        <div class="flex flex-column gap-3">
          <div class="field">
            <label class="block mb-2 font-bold">道次</label>
            <InputText
              v-model="road"
              placeholder="道次号"
              class="w-full"
              disabled
            />
          </div>

          <div class="field">
            <label class="block mb-2 font-bold">成绩</label>
            <div class="flex align-items-center gap-2">
              <InputText
                v-model="rawScore"
                placeholder="输入成绩"
                class="w-full"
              />
              <span class="text-color-secondary whitespace-nowrap">{{
                props.currentEvent?.unit || ""
              }}</span>
            </div>
          </div>

          <div class="field-checkbox flex align-items-center gap-2">
            <Checkbox v-model="isValid" :binary="true" inputId="validCheck" />
            <label for="validCheck" class="font-bold">成绩有效</label>
          </div>

          <div v-if="!isValid" class="flex flex-column gap-2">
            <div class="field">
              <label class="block mb-2">犯规类型</label>
              <Select
                v-model="invalidType"
                :options="foulOptions"
                option-label="label"
                option-value="value"
                placeholder="选择犯规类型"
                class="w-full"
              />
            </div>
            <div class="field">
              <label class="block mb-2">犯规原因备注（可选）</label>
              <InputText
                v-model="invalidReason"
                placeholder="输入备注"
                class="w-full"
              />
            </div>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>
