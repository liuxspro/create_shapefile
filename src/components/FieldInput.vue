<template>
  <div class="mb-2 p-4 lg:p-4 border border-slate-300 rounded-md">
    <n-collapse :default-expanded-names="['1']" class="min-h-4">
      <n-collapse-item name="1">
        <template #header>
          <h1 class="text-center w-full">填写字段</h1>
        </template>
        <div class="mt-2">
          <n-form label-placement="left" :show-feedback="false">
            <n-form-item label="调查阶段:" class="mb-3">
              <n-select v-model:value="select_stage" :options="stage_options" placeholder="选择调查阶段"
                @update:value="handleUpdateValue" />
            </n-form-item>
          </n-form>
        </div>
        <!-- 填写字段 -->
        <div id="fields">
          <!-- 必要字段 文本型 -->
          <n-form label-placement="left" label-width="5rem" show-require-mark :show-feedback="false">
            <n-form-item label="DKMC" class="mb-3 dark:text-slate-100">
              <n-input size="" v-model:value="fields['DKMC']" :maxlength="254" show-count type="text"
                v-bind:placeholder="'请输入' + fileds_info['DKMC']" />
            </n-form-item>
            <n-form-item label="DKDM" class="mb-3 dark:text-slate-100">
              <n-input size="" v-model:value="fields['DKDM']" :maxlength="100" show-count type="text"
                v-bind:placeholder="'请输入' + fileds_info['DKDM']" @input="handleUpdateValue" />
            </n-form-item>
            <n-form-item label="XZQDM" class="mb-3 dark:text-slate-100">
              <n-input size="" v-model:value="fields['XZQDM']" :maxlength="12" show-count type="text"
                v-bind:placeholder="'请输入' + fileds_info['XZQDM']" />
            </n-form-item>
            <n-form-item label="XZQMC" class="mb-3 dark:text-slate-100">
              <n-input size="" v-model:value="fields['XZQMC']" :maxlength="100" show-count type="text"
                v-bind:placeholder="'请输入' + fileds_info['XZQMC']" />
            </n-form-item>
          </n-form>
          <div>
            <!-- 必要字段  地块面积和带号 -->
            <n-form label-placement="left" show-require-mark :show-feedback="false">
              <n-form-item label="YDMJ" class="mb-3">
                <n-input-number size="medium" :precision="2" v-model:value="fields['YDMJ']"
                  v-bind:placeholder="'请输入' + fileds_info['YDMJ']" clearable class="w-full" label-width="5rem" />
              </n-form-item>
              <n-form-item label="DH" class="mb-3">
                <n-input-number size="medium" :precision="0" v-model:value="fields['DH']"
                  v-bind:placeholder="'请输入' + fileds_info['DH']" clearable class="w-full" label-width="5rem"
                  show-require-mark />
              </n-form-item>
            </n-form>
          </div>
          <!-- 日期、生产单位及备注 -->
          <n-form label-placement="left" :show-feedback="false">
            <n-form-item label="SCRQ" class="mb-3">
              <n-date-picker v-model:value="fields['SCRQ']" type="date" value-format="yyyy-MM-dd" placeholder="请输入日期"
                class="w-full" />
            </n-form-item>
            <n-form-item label="SCDW" class="mb-3">
              <n-input size="medium" v-model:value="fields['SCDW']" :maxlength="FIELD_LENGTH['SCDW']" show-count
                type="text" v-bind:placeholder="'请输入' + fileds_info['SCDW']" class="w-full"></n-input>
            </n-form-item>
            <n-form-item label="BZ" class="mb-3">
              <n-input size="medium" v-model:value="fields['BZ']" :maxlength="FIELD_LENGTH['BZ']" show-count type="text"
                v-bind:placeholder="'请输入' + fileds_info['BZ']" class="w-full"></n-input>
            </n-form-item>
          </n-form>
        </div>
      </n-collapse-item>
    </n-collapse>
  </div>


</template>

<script setup>
import { ref } from "vue";
import { FIELD_LENGTH } from "../utils/dbf";
import { NInput, NForm, NFormItem, NInputNumber, NDatePicker, NSelect, NCollapse, NCollapseItem } from "naive-ui";
import { useMessage, useDialog } from "naive-ui";
import { create_text_style, create_polygon_style } from "../utils/ol";


const message = useMessage();
const dialog = useDialog();
const { fields, vec_layer } = defineProps(["fields", "vec_layer"]);
const emit = defineEmits(['update-stage']);
const select_stage = ref("初步调查");

const fileds_info = {
  DKMC: "地块名称",
  DKDM: "地块代码",
  XZQDM: "行政区代码",
  XZQMC: "行政区名称",
  YDMJ: "地块面积",
  DH: "带号",
  SCRQ: "生产日期",
  SCDW: "生产单位",
  BZ: "备注",
};
const stage_options = [
  { label: "初步调查", value: "初步调查" },
  { label: "详细调查", value: "详细调查" },
];


function handleUpdateValue() {
  const DKDM = fields.DKDM;
  if (DKDM.length >= 14) {
    message.warning("地块代码长度应为13位");
  }
  emit('update-stage', select_stage.value);
  if (vec_layer) {
    const display_text = `${select_stage.value}${DKDM}`;
    const ploygon_style = create_polygon_style();
    ploygon_style.setText(create_text_style(display_text));
    vec_layer.setStyle(ploygon_style);
  }

}

function check_field_input() {
  let {
    DKMC,
    DKDM,
    XZQDM,
    XZQMC,
    YDMJ,
    DH,
    SCRQ = null,
    SCDW = null,
    BZ = null,
  } = fields;
  const requiredFields = { DKMC, DKDM, XZQDM, XZQMC, YDMJ, DH };
  for (const field of Object.keys(requiredFields)) {
    if (requiredFields[field] === undefined || requiredFields[field] === "") {
      dialog.error({
        title: "错误",
        content: `${field} 为空`,
        positiveText: "确定",
        maskClosable: false,
      });
      return false;
    }
  }
  if (!(25 <= DH && DH <= 45)) {
    dialog.error({
      title: "错误",
      content: "带号范围应在25~45之间",
      positiveText: "确定",
      maskClosable: false,
    });
    return false;
  }
  return true;
}

defineExpose({ check_field_input })
</script>
