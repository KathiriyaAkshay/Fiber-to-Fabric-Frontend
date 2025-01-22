export const getDisplayQualityName = (quality) => {
  let quality_name = quality?.quality_name;
  let quality_weight = quality?.quality_weight;
  let quality_design_no = quality?.design_no;

  //   return `${quality_name ? quality_name : ""} ( ${
  //     quality_design_no ? quality_design_no : ""
  //   } ) - ${quality_weight ? quality_weight : ""}KG`;

  return (
    `${quality_name ? quality_name : ""}` +
    `${quality_design_no ? `( ${quality_design_no} )` : ""}` +
    `${quality_weight ? ` - ${quality_weight}KG` : ""}`
  );
};

export const getDisaplyWrapDennierName = (record) => {
  // Name format
  // Dennier/Filament (yarn febric type(yarn sub type)) - luster type - yarn color

  let yarn_dennier =
    record?.inhouse_waraping_detail?.yarn_stock_company?.yarn_denier;
  let yarn_filament =
    record?.inhouse_waraping_detail?.yarn_stock_company?.filament;
  let yarn_type =
    record?.inhouse_waraping_detail?.yarn_stock_company?.yarn_type;
  let yarn_sub_type =
    record?.inhouse_waraping_detail?.yarn_stock_company?.yarn_Sub_type;
  let luster_type =
    record?.inhouse_waraping_detail?.yarn_stock_company?.luster_type;
  let yarn_color =
    record?.inhouse_waraping_detail?.yarn_stock_company?.yarn_color;

  return `${yarn_dennier}D/${yarn_filament}F (${yarn_type}(${yarn_sub_type}))-${luster_type}-${yarn_color}`;
};

export const getYarnStockCompany = (record) => {
  
  // return(

  // )
}