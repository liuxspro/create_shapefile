<template>
  <div id="guide" class="px-8 pt-1">
    <h2 class="text-xl mt-2 font-semibold">使用说明:</h2>
    <div>
      <h3>1. 上传地块坐标</h3>
      <h4 class="pl-2 border-l-4 border-slate-300 my-1">CSV 文件格式 ⚠️注意要有标题行 ！！</h4>
      <div class="flex flex-col justify-stretch lg:flex-row">
        <div class="w-full">
          <div class="text-xs">
            <p>经纬度坐标</p>
            <p>按照: 拐点编号、经度、纬度的顺序排列.</p>
          </div>
          <div class="font-mono text-xs border p-2 rounded-md mr-2 dark:border-gray-500">
            <pre class="whitespace-pre-line">
                <code>编号,经度,纬度</code>
                <code>1,117.513070,34.307738</code>
                <code>2,117.513274,34.309178</code>
                <code>3,117.514937,34.309049</code>
                <code>4,117.514722,34.305380</code>
                <code>5,117.510045,34.305752</code>
                <code>6,117.510372,34.307986</code>
            </pre>
          </div>
        </div>
        <div class="w-full">
          <div class="text-xs">
            <p>投影坐标</p>
            <p>按照: 编号，X（北坐标），Y（东坐标，含带号）的顺序排列.</p>
          </div>
          <div class="font-mono text-xs border p-2 rounded-md dark:border-gray-500">
            <pre class="whitespace-pre-line">
                <code>编号,X,Y</code>
                <code>1,3797916.479,39547228.491</code>
                <code>2,3798076.324,39547246.449</code>
                <code>3,3798062.844,39547399.598</code>
                <code>4,3797655.744,39547381.907</code>
                <code>5,3797694.864,39546951.091</code>
                <code>6,3797942.755,39546979.970</code>
            </pre>
          </div>
        </div>
      </div>
      <h4 class="pl-2 border-l-4 border-slate-300 my-1">KML 文件格式</h4>
      <p>也可以直接使用地块的 kml 文件 （面文件,线文件和点文件可能会出问题）.</p>
    </div>
    <div>
      <h3>2. 填写字段信息</h3>
      <div>
        <div id="field_img">
          <div class="my-2">
            <span>选择调查阶段:</span> <code class="field_name">初步调查</code>
            <code class="field_name">详细调查</code>
          </div>
          <div class="my-2 leading-8">
            <span>必填字段:</span>
            <code class="field_name">地块名称</code> <code class="field_name">地块代码</code>
            <code class="field_name">行政区代码</code><code class="field_name">行政区名称</code>
            <code class="field_name">用地面积</code><code class="field_name">带号</code>(根据上传文件自动填写)
          </div>
          <div>
            <span>其他字段:</span>
            <span>可选填</span>
            <code class="field_name">生产日期</code>
            <code class="field_name">生产单位</code>
            <span>及</span>
            <code class="field_name">备注</code>
          </div>
        </div>
        <h3>3. 生成边界文件</h3>
        <div>
          <p>
            <span>如果地块位置在地图预览中正确, 点击</span>
            <code class="field_name">生成边界文件按钮</code>
            <span> , 即可下载边界文件.</span>
          </p>
          <p class="mb-4">边界文件已根据所处阶段和地块编码自动命名, 并打包为📦ZIP, 可直接上传至系统.</p>
          <img src="@/assets/生成文件示意图.svg" alt="" srcset="" width="80%" class="my-0 mx-auto" />
          <p class="mb-4"></p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
h3 {
  @apply font-semibold text-lg mt-4 text-gray-900 dark:text-gray-300;
}

code.field_name {
  @apply p-1 border bg-gray-200 rounded-md m-1 dark:bg-slate-500 dark:border-slate-400 font-sans whitespace-nowrap;
}
</style>
