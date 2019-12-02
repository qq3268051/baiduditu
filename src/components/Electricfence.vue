<template>
  <el-dialog
    :visible.sync="hospitaladdvisible"
    append-to-body
    @opened="opendialog"
    width="65%"
    :close-on-click-modal="false"
    :title="title"
  >
    <div style="position:relative">
      <!--<el-color-picker class="color_picker" v-model="color1"></el-color-picker>-->
      <baidu-map
        class="bm-view map"
        :center="centerPosition"
        :zoom="zoom"
        @ready="handler"
        :scroll-wheel-zoom="true"
        :mapClick="false"
      ></baidu-map>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button
        type="primary"
        v-if="!showStyle&&overlaysDoc&&overlays&&overlays.drawingMode!='marker'"
        @click="edit"
      >编辑</el-button>
      <el-button type="primary" @click="saver">保存</el-button>
      <el-button @click="hospitaladdvisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import "@/components/js/DrawingManager_min.css";
export default {
  name: "Electricfence",
  data() {
    return {
      hospitaladdvisible: false,
      title: "绘制电子围栏",
      centerPosition: { lng: 115.031569, lat: 35.767359 },
      zoom: 15,
      color1: "#409EFF",
      BMap: null,
      map: null,
      styleOptions: {
        strokeColor: "#409EFF", //边线颜色。
        fillColor: "#409EFF", //填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 3, //边线的宽度，以像素为单位。
        strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。
        fillOpacity: 0.6, //填充的透明度，取值范围0 - 1。
        strokeStyle: "solid" //边线的样式，solid或dashed。
      },
      overlays: "", //传入父级的数据
      overlaysDoc: "", //绘制出的数据（用于编辑 清除功能）
      drawingManager: null, //绘制组件
      showStyle: null //编辑进入存储的数据
    };
  },
  watch: {
    hospitaladdvisible(val) {
      //初始化清除
      if (!val) {
        this.centerPosition = { lng: 115.031569, lat: 35.767359 };
        this.zoom = 15;
        this.styleOptions = {
          strokeColor: "red", //边线颜色。
          fillColor: "red", //填充颜色。当参数为空时，圆形将没有填充效果。
          strokeWeight: 3, //边线的宽度，以像素为单位。
          strokeOpacity: 0.8, //边线透明度，取值范围0 - 1。
          fillOpacity: 0.6, //填充的透明度，取值范围0 - 1。
          strokeStyle: "solid" //边线的样式，solid或dashed。
        };
        this.overlays = "";
        this.overlaysDoc = "";
        this.showStyle = null;
      }
      if (this.map) {
        this.map.clearOverlays();
        this.drawingManager.close();
      }
    },
    color1(val){
      console.log(val)
    }
  },
  methods: {
    colorsFn(){
      console.log(this.color1)
    },
    electricFenceFn(data) {
      //打开弹框
      this.hospitaladdvisible = true;
      let _this = this;
      if (data.overlays) {
        this.showStyle = data;
      }
    },
    handler({ BMap, map }) {
      this.BMap = BMap;
      this.map = map;
      require("@/components/js/DrawingManager_min.js"); //引用绘制js
      this.info();
    },
    clearAll() {
      //清除当前绘制的围栏
      this.map.removeOverlay(this.overlaysDoc.overlay);
      this.overlaysDoc = "";
    },
    opendialog() {
      //父级编辑回显
      let _this = this;
      if (this.showStyle) {
        let { overlays, drawingMode } = this.showStyle;
        overlays = overlays.split(";");
        overlays.pop();
        switch (drawingMode) {
          case "circle": //圆
            let circleData = overlays.join(",");
            circleData = circleData.split(",");
            this.overlays = {
              //回显数据用于传给父级
              drawingMode,
              paths: {
                r: circleData[2],
                lng: circleData[0],
                lat: circleData[1]
              }
            };
            var mPoint = new BMap.Point(circleData[0], circleData[1]);
            var circle1 = new BMap.Circle(
              mPoint,
              circleData[2],
              this.styleOptions
            );

            this.map.addOverlay(circle1); //创建圆
            circle1.enableEditing(); //可编辑圆
            circle1.addEventListener("lineupdate", function(e) {
              //监听编辑圆后得到的数据用于传给父级
              _this.overlays = {
                drawingMode,
                paths: {
                  r: e.currentTarget.getRadius(),
                  lng: e.currentTarget.getCenter().lng,
                  lat: e.currentTarget.getCenter().lat
                }
              };
            });
            this.overlaysDoc = { overlay: circle1 };
            break;
          case "marker": //点
            let markerData = overlays.join(",");
            markerData = markerData.split(",");
            this.overlays = {
              drawingMode,
              paths: {
                lng: markerData[0],
                lat: markerData[1]
              }
            };
            var marker = new BMap.Marker(
              new BMap.Point(markerData[0], markerData[1])
            );
            this.map.addOverlay(marker);
            this.overlaysDoc = { overlay: marker };
            break;
          default:
            //画线，多边形，矩形
            let arr = [];
            overlays.map(item => {
              arr.push(new BMap.Point(item.split(",")[0], item.split(",")[1]));
            });
            let polygon = new BMap.Polygon(arr, this.styleOptions);
            this.map.addOverlay(polygon);
            polygon.enableEditing();
            let paths = polygon.getPath();
            _this.overlays = {
              drawingMode,
              paths
            };
            polygon.addEventListener("lineupdate", function(e) {
              paths = e.currentTarget.getPath();
              _this.overlays = {
                drawingMode,
                paths
              };
            });
            this.overlaysDoc = { overlay: polygon };
            break;
        }
      }
    },
    info() {
      let _this = this;
      //实例化鼠标绘制工具
      this.drawingManager = new window.BMapLib.DrawingManager(this.map, {
        isOpen: false, //是否开启绘制模式
        enableDrawingTool: true, //是否显示工具栏
        drawingToolOptions: {
          anchor: BMAP_ANCHOR_TOP_RIGHT, //位置
          offset: new BMap.Size(5, 5) //偏离值
        },
        circleOptions: _this.styleOptions, //圆的样式
        polylineOptions: _this.styleOptions, //线的样式
        polygonOptions: _this.styleOptions, //多边形的样式
        rectangleOptions: _this.styleOptions //矩形的样式
      });

      this.drawingManager.addEventListener("overlaycomplete", function(a, b) {
        //绘制后返回的数据
        _this.clearAll();
        _this.showStyle = "";
        _this.overlaysDoc = b;
        switch (b.drawingMode) {
          case "circle": //圆
            _this.overlays = {
              drawingMode: b.drawingMode,
              paths: {
                r: b.overlay.getRadius(),
                lng: b.overlay.getCenter().lng,
                lat: b.overlay.getCenter().lat
              }
            };
            break;
          case "marker": //点
            _this.overlays = {
              drawingMode: b.drawingMode,
              paths: {
                lng: b.overlay.getPosition().lng,
                lat: b.overlay.getPosition().lat
              }
            };
            break;
          default:
            //画线，多边形，矩形
            let paths = b.overlay.getPath();
            _this.overlays = {
              drawingMode: b.drawingMode,
              paths
            };
            break;
        }
      });
    },
    edit() {
      //绘制编辑
      this.drawingManager.close();
      this.overlaysDoc.overlay.enableEditing();
    },
    saver() {
      //提交数据给父级
      let data = {
        overlays: this.overlays
      };
      this.$emit("fence", data);
      this.hospitaladdvisible = false;
    }
  }
};
</script>
<style scoped>
.bm-view {
  width: 100%;
  height: 60vh;
}
.color_picker {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
}
.dialog-footer {
  text-align: center;
}
</style>
