import { feature } from "topojson-client";
import thailandTopo from "../../../config/province_region6_topo.json";
import thailandGeo from "../../../config/th.json";

export function getAreaGeo(region, province) {
  const geo = feature(thailandTopo, thailandTopo.objects.data);

  // 🏙️ จังหวัดมาก่อนเสมอ
  if (province && province !== "all") {
    const features = geo.features.filter(
      (f) => f.properties?.ADM1_TH === province
    );
    return { ...geo, features };
  }

  // 🗺️ ภาค
  if (region && region !== "all") {
    const features = geo.features.filter(
      (f) => f.properties?.REGION4 === region
    );
    return { ...geo, features };
  }

  // 🌏 ประเทศ
  return thailandGeo;
}
