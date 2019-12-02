<template>
  <div class="home">
    <el-form :inline="true" :model="formInline" class="demo-form-inline">
      <el-form-item label="围栏信息">
        <el-input type="textarea" readonly v-model="formInline.orgweilan"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="setDrawing">更新电子围栏</el-button>
      </el-form-item>
    </el-form>
    <ElectricFence ref="ElectricFenceRef" @fence="fenceFn" />
  </div>
</template>

<script>
// @ is an alias to /src
import ElectricFence from "@/components/Electricfence.vue";

export default {
  name: "bmlusu",
  components: {
    ElectricFence
  },
  data() {
    return {
      formInline: {//围栏数据
        orgweilan: ""
      },
      drawingMode: ""//围栏类型（circle，marker……）
    };
  },
  methods: {
    setDrawing() {
      let data = {
        overlays:this.formInline.orgweilan,
        drawingMode:this.drawingMode
      }
      this.$refs.ElectricFenceRef.electricFenceFn(//传入子级
        data
      );
    },
    fenceFn(data) {//子级传入父级
      let str = "";
      switch (data.overlays.drawingMode) {
        case "circle": //圆
          str =
            data.overlays.paths.lng + "," + data.overlays.paths.lat + "," + data.overlays.paths.r + ";";
          break;
        case "marker": //点
          str = data.overlays.paths.lng + "," + data.overlays.paths.lat + ";";
          break;
        default:
          //画线，多边形，矩形
           data.overlays.paths.length&&data.overlays.paths.map(item => {
            let str1 = item.lng + "," + item.lat;
            str += str1 + ";";
          });
          break;
      }
      this.formInline.orgweilan = str;
      this.drawingMode = data.overlays.drawingMode;
    }
  }
};
</script>
<style scoped="scoped">
/* eslint-disable */
.home {
  margin: 100px auto;
  width: 500px;
}
</style>
