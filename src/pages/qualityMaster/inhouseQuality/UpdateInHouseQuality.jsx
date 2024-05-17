import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
  Card,
  Divider,
  Checkbox,
  Typography,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { DevTool } from "@hookform/devtools";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  QUALITY_GROUP_LIST,
  YARN_TYPE_LIST,
} from "../../../constants/yarnStockCompany";
import { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import {
  getDesignNoDropDownRequest,
  getInHouseQualityByIdRequest,
  // addTradingQualityRequest,
  getQualityNameDropDownRequest,
  updateInHouseQualityRequest,
} from "../../../api/requests/qualityMaster";
import { CloseOutlined, PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { getYSCDropdownList } from "../../../api/requests/reports/yarnStockReport";
import { getCompanyMachineListRequest } from "../../../api/requests/machine";

const PRODUCTION_TYPE = {
  type1: "taka(in house)", 
  type2: "purchase/trading", 
  type3: "job"
};

const addYSCSchemaResolver = yupResolver(
  yup.object().shape({
    quality_name: yup.string().required("Please enter quality name."),
    quality_group: yup.string().required("Please enter quality group."),
    vat_hsn_no: yup.string().required("Please enter VAT HSN No."),
    machine_name: yup.string().required("Please enter machine name."),
    design_no: yup.string().required("Please enter design no."),
    licence_meter: yup.string().required("Please enter licence meter."),
    yarn_type: yup.string().required("Please enter yarn type."),
    weight_from: yup.string().required("Please enter weight from."),
    weight_to: yup.string().required("Please enter weight to."),
    production_rate: yup.string().required("Please enter production rate."),
    max_taka: yup.string().required("Please enter max taka."),
    // production_type: yup.string(),
    // other_quality_name: yup.string(),
    // other_quality_weight: yup.string(),
  })
);

const UpdateInHouseQuality = () => {
  // const queryClient = useQueryClient();
  const navigate = useNavigate();
  const params = useParams();
  const { qualityId: id } = params;

  const [qualityNamesData, setQualityNamesData] = useState([]);
  const [options, setOptions] = useState([]);
  
  const [designNo, setDesignNo] = useState([]);
  const [designNoOption, setDesignNoOption] = useState([]);
  const [denierOptions, setDenierOptions] = useState([]);
  
  const [needQualityNameInChallan, setNeedQualityNameInChallan] =
    useState(true);
  const [needQualityGroupInChallan, setNeedQualityGroupInChallan] =
    useState(false);
  const [needDesignNoInChallan, setNeedDesignNoInChallan] = useState(false);
  const [qualityDetailWeightFix, setQualityDetailWeightFix] = useState(false);

  const [isTaarPasariaRate, setIsTaarPasariaRate] = useState(false);
  const [isMeterBeamMakerPrimary, setIsMeterBeamMakerPrimary] = useState(false);
  const [isMeterBeamMakerSecondary, setIsMeterBeamMakerSecondary] =
    useState(false);
  const [isTaarBeamPissingSecondary, setIsTaarBeamPissingSecondary] =
    useState(false);

  const [productionType1, setProductionType1] = useState(true);
  const [productionType2, setProductionType2] = useState(false);
  const [productionType3, setProductionType3] = useState(false);

  const [warpingFormArray, setWarpingFormArray] = useState([0]);
  const [weftFormArray, setWeftFormArray] = useState([0]);

  const [tana, setTana] = useState(0);
  const [wana, setWana] = useState(0);

  const { companyId } = useContext(GlobalContext);

  function goBack() {
    navigate(-1);
  }

  
  const { data: inHouseQualityDetail } = useQuery({
    queryKey: ["inHouseQuality", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getInHouseQualityByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateInHouseQuality } = useMutation({
    mutationFn: async (data) => {
      const res = await updateInHouseQualityRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["quality-master", "in-house-quality", "update", id],
    onSuccess: (res) => {
      //   queryClient.invalidateQueries([
      //     "yarn-stock",
      //     "company",
      //     "list",
      //     companyId,
      //   ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
      navigate(-1);
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    let quality;
    if (data.quality_name === 0 || data.quality_name === "0") {
      if (!data.other_quality_name || data.other_quality_name === "") {
        setError("other_quality_name", {
          type: "manual",
          message: "Please enter quality name.",
        });
        return;
      }
      if (!data.other_quality_weight || data.other_quality_weight === null) {
        setError("other_quality_weight", {
          type: "manual",
          message: "Please enter quality weight.",
        });
        return;
      }
      quality = {
        quality_name: data.other_quality_name,
        quality_weight: data.other_quality_weight,
      };
    } else {
      quality = qualityNamesData.find(
        (item) => item.id === parseInt(data.quality_name)
      );
    }

    let design;
    if (data.design_no === 0 || data.design_no === "0") {
      if (!data.other_design_no || data.other_design_no === null) {
        setError("other_design_no", {
          type: "manual",
          message: "Please enter design no.",
        });
        return;
      }
      design = {
        design_no: data.other_design_no,
      };
    } else {
      // const data2 = designNo.find(
      //   (item) => item.id === parseInt(data.design_no)
      // );
      design = { design_no: data.design_no };
    }

    const warping_detail = warpingFormArray.map((field, index) => {
      return {
        yarn_stock_company_id: data[`yarn_stock_company_id_${index}`],
        tars: parseInt(data[`tars_${index}`]),
        tpm: parseInt(data[`warping_tpm_${index}`]),
        warping_weight: parseInt(data[`warping_weight_${index}`]),
        is_primary:
          data[`is_primary_${index}`] === undefined
            ? true
            : data[`is_primary_${index}`],
        total_weight: 100,
      };
    });

    const weft_detail = weftFormArray.map((field, index) => {
      return {
        yarn_stock_company_id: data[`weft_yarn_stock_company_id_${index}`],
        pano: parseInt(data[`pano_${index}`]),
        peak: parseInt(data[`peak_${index}`]),
        dobby_rpm: parseInt(data[`dobby_rpm_${index}`]),
        production_per_day: parseInt(data[`production_per_day_${index}`]),
        read: parseInt(data[`read_${index}`]),
        tpm: parseInt(data[`weft_tpm_${index}`]),
        weft_weight: parseInt(data[`weft_weight_${index}`]),
        total_weight: 100,
      };
    });
    let production_type = [];
    if (productionType1) {
      production_type.push("taka(in house)");
    }
    if (productionType2) {
      production_type.push("purchase/trading");
    }
    if (productionType3) {
      production_type.push("job");
    }

    const newData = {
      quality_detail: {
        quality_name: quality.quality_name,
        quality_weight: parseFloat(quality.quality_weight),
        quality_group: data.quality_group,
        machine_name: data.machine_name,
        design_no: design.design_no,
        vat_hsn_no: data.vat_hsn_no,
        licence_meter: parseFloat(data.licence_meter),
        yarn_type: data.yarn_type,
        weight_from: parseFloat(data.weight_from),
        weight_to: parseFloat(data.weight_to),
        production_rate: parseFloat(data.production_rate),
        max_taka: parseFloat(data.max_taka),
        tpm_z: parseFloat(data.tpm_z),
        tpm_s: parseFloat(data.tpm_s),
        need_quality_name_in_challan: needQualityNameInChallan,
        need_quality_group_in_challan: needQualityGroupInChallan,
        need_design_no_in_challan: needDesignNoInChallan,
        production_type,

        require_non_pasarela_beam: parseFloat(data.require_non_pasarela_beam),
        require_pasarela_beam: parseFloat(data.require_pasarela_beam),
      },
      beam_rate: {
        pasaria_rate: parseFloat(data.beam_spreader_pasaria_rate_taar),
        is_taar_pasaria_rate: isTaarPasariaRate,
        beam_maker_primary: parseFloat(data.beam_maker_primary_meter),
        is_meter_beam_maker_primary: isMeterBeamMakerPrimary,
        beam_maker_secondary: parseFloat(data.beam_maker_secondary_meter),
        is_meter_beam_maker_secondary: isMeterBeamMakerSecondary,
        beam_pissing_secondary: parseFloat(data.beam_pissing_secondary_taar),
        is_taar_beam_pissing_secondary: isTaarBeamPissingSecondary,
      },
      warping_detail,
      weft_detail,
    };
    await updateInHouseQuality(newData);
  };

  const { data: machineListRes, isLoading: isLoadingMachineList } = useQuery({
    queryKey: ["machine", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getCompanyMachineListRequest({
        companyId,
        params: { company_id: companyId },
      });
      return res.data?.data?.machineList;
    },
    enabled: Boolean(companyId),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    setError,
    clearErrors,
    watch,
  } = useForm({
    defaultValues: {
      quality_name: null,
      other_quality_name: "",
      other_quality_weight: "",
      quality_group: null,
      machine_name: null,
      design_no: null,
      other_design_no: "",
      vat_hsn_no: "",
      licence_meter: "",
      yarn_type: null,
      weight_from: "",
      weight_to: "",
      production_rate: 0,
      max_taka: 0,
      production_type: "taka(in house)",
      tpm_z: "",
      tpm_s: "",

      beam_spreader_pasaria_rate_taar: 0,
      beam_maker_primary_meter: 0,
      beam_maker_secondary_meter: 0,
      beam_pissing_secondary_taar: 0,

      require_non_pasarela_beam: "",
      require_pasarela_beam: "",
    },
    resolver: addYSCSchemaResolver,
  });
  const { quality_name, design_no, yarn_type } = watch();

  const { mutateAsync: searchQualityName } = useMutation({
    mutationFn: async (searchValue) => {
      const res = await getQualityNameDropDownRequest({
        params: {
          company_id: companyId,
          search: searchValue,
        },
      });
      return res.data;
    },
    // mutationKey: ["quality-master", "trading-quality", "add"],
    onSuccess: (res) => {
      if (res.success) {
        if (res.data.row.length) {
          setQualityNamesData(res.data.row);
          setOptions(
            res.data.row.map((item) => ({
              label: item.quality_name,
              value: item.id,
            }))
          );
        } else {
          setOptions([{ label: "Other", value: 0 }]);
          setQualityNamesData([]);
        }
      } else {
        setQualityNamesData([]);
        setOptions([{ label: "Other", value: 0 }]);
      }
      //   const successMessage = res?.message;
      //   if (successMessage) {
      //     message.success(successMessage);
      //   }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const { mutateAsync: getDesignNoData } = useMutation({
    mutationFn: async () => {
      const res = await getDesignNoDropDownRequest({
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    // mutationKey: ["quality-master", "trading-quality", "add"],
    onSuccess: (res) => {
      if (res.success) {
        if (res.data.length) {
          setDesignNo(res.data);
          setDesignNoOption(() => {
            return [
              ...res.data.map((item) => ({
                label: item.design_name,
                value: item.design_name,
              })),
              {
                label: "Other",
                value: 0,
              },
            ];
          });
        } else {
          setDesignNoOption([{ label: "Other", value: 0 }]);
          setDesignNo([]);
        }
      } else {
        setDesignNo([]);
        setDesignNoOption([{ label: "Other", value: 0 }]);
      }
      //   const successMessage = res?.message;
      //   if (successMessage) {
      //     message.success(successMessage);
      //   }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const { mutateAsync: getYarnCompanyList } = useMutation({
    mutationFn: async () => {
      const res = await getYSCDropdownList({
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    // mutationKey: ["quality-master", "trading-quality", "add"],
    onSuccess: (res) => {
      if (res.success) {
        if (res.data.length) {
          // setDesignNo(res.data);
          // setDesignNoOption(() => {
          //   return [
          //     ...res.data.map((item) => ({
          //       label: item.design_name,
          //       value: item.id,
          //     })),
          //     {
          //       label: "Other",
          //       value: 0,
          //     },
          //   ];
          // });
        } else {
          // setDesignNoOption([{ label: "Other", value: 0 }]);
          // setDesignNo([]);
        }
      } else {
        // setDesignNo([]);
        // setDesignNoOption([{ label: "Other", value: 0 }]);
      }
      //   const successMessage = res?.message;
      //   if (successMessage) {
      //     message.success(successMessage);
      //   }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const { data: yscdListRes, isLoading: isLoadingYSCDList } = useQuery({
    queryKey: ["dropdown", "yarn_company", "list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getYSCDropdownList({
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    // set options for denier selection on yarn stock company select
    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      // const { yarn_company_name: name = "", yarn_details = [] } = ysc;
      const { yarn_details = [] } = ysc;
      // if (name === yarn_company_name) {
      const options = yarn_details?.map(
        ({
          yarn_company_id = 0,
          filament = 0,
          yarn_denier = 0,
          luster_type = "",
          yarn_color = "",
        }) => {
          return {
            label: `${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`,
            value: yarn_company_id,
          };
        }
      );
      if (options?.length) {
        setDenierOptions(options);
      }
      // }
    });
  }, [yscdListRes?.yarnCompanyList]);

  useEffect(() => {
    if (companyId) {
      getDesignNoData();
      getYarnCompanyList();
    }
  }, [companyId, getDesignNoData, getYarnCompanyList]);
 
  const addWarpingDetailRow = (indexValue) => {
    let isValid = true;

    warpingFormArray.forEach((item, index) => {
      clearErrors(`yarn_stock_company_id_${index}`);
      clearErrors(`tars_${index}`);
      clearErrors(`warping_tpm_${index}`);
      clearErrors(`warping_weight_${index}`);
    });

    warpingFormArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`yarn_stock_company_id_${index}`)) {
          setError(`yarn_stock_company_id_${index}`, {
            type: "manual",
            message: "Please select yarn stock company",
          });
          isValid = false;
        }
        if (!getValues(`tars_${index}`)) {
          setError(`tars_${index}`, {
            type: "manual",
            message: "Please enter tars.",
          });
          isValid = false;
        }
        if (!getValues(`warping_tpm_${index}`)) {
          setError(`warping_tpm_${index}`, {
            type: "manual",
            message: "Please enter tpm.",
          });
          isValid = false;
        }
        if (!getValues(`warping_weight_${index}`)) {
          setError(`warping_weight_${index}`, {
            type: "manual",
            message: "Please enter warping weight.",
          });
          isValid = false;
        }
        if (!getValues(`yarn_stock_company_id_${index}`)) {
          setError(`yarn_stock_company_id_${index}`, {
            type: "manual",
            message: "Please select yarn stock company",
          });
          isValid = false;
        }
      }
    });

    if (isValid) {
      const nextValue = warpingFormArray.length;
      setWarpingFormArray((prev) => {
        return [...prev, nextValue];
      });
    }
  };

  const deleteWarpingDetailRow = (field) => {
    const newFields = [...warpingFormArray];
    newFields.splice(field, 1);
    setWarpingFormArray(newFields);
  };

  const addWeftDetailRow = (indexValue) => {
    let isValid = true;

    weftFormArray.forEach((item, index) => {
      clearErrors(`weft_yarn_stock_company_id_${index}`);
      clearErrors(`pano_${index}`);
      clearErrors(`peak_${index}`);
      clearErrors(`dobby_rpm_${index}`);

      clearErrors(`production_per_day_${index}`);
      clearErrors(`read_${index}`);
      clearErrors(`weft_tpm_${index}`);
      clearErrors(`weft_weight_${index}`);
    });

    weftFormArray.forEach((item, index) => {
      if (index === indexValue) {
        if (!getValues(`weft_yarn_stock_company_id_${index}`)) {
          setError(`weft_yarn_stock_company_id_${index}`, {
            type: "manual",
            message: "Please select yarn stock company",
          });
          isValid = false;
        }
        if (!getValues(`pano_${index}`)) {
          setError(`pano_${index}`, {
            type: "manual",
            message: "Please enter pano.",
          });
          isValid = false;
        }
        if (!getValues(`peak_${index}`)) {
          setError(`peak_${index}`, {
            type: "manual",
            message: "Please enter peak.",
          });
          isValid = false;
        }
        if (!getValues(`dobby_rpm_${index}`)) {
          setError(`dobby_rpm_${index}`, {
            type: "manual",
            message: "Please enter dobby rpm.",
          });
          isValid = false;
        }
        if (!getValues(`production_per_day_${index}`)) {
          setError(`production_per_day_${index}`, {
            type: "manual",
            message: "Please enter production per day.",
          });
          isValid = false;
        }
        if (!getValues(`read_${index}`)) {
          setError(`read_${index}`, {
            type: "manual",
            message: "Please enter read.",
          });
          isValid = false;
        }
        if (!getValues(`weft_tpm_${index}`)) {
          setError(`weft_tpm_${index}`, {
            type: "manual",
            message: "Please enter tpm.",
          });
          isValid = false;
        }
        if (!getValues(`weft_weight_${index}`)) {
          setError(`weft_weight_${index}`, {
            type: "manual",
            message: "Please enter weft weight.",
          });
          isValid = false;
        }
      }
    });

    if (isValid) {
      const nextValue = weftFormArray.length;
      setWeftFormArray((prev) => {
        return [...prev, nextValue];
      });
    }
  };

  const deleteWeftDetailRow = (field) => {
    const newFields = [...weftFormArray];
    newFields.splice(field, 1);
    setWeftFormArray(newFields);
  };

  const calculateTanaWana = () => {
    let totalTana = 0;
    warpingFormArray.forEach((field, index) => {
      const warping_weight = getValues(`warping_weight_${index}`) ?? 0;
      totalTana += parseFloat(warping_weight);
    });

    let totalWana = 0;
    weftFormArray.forEach((field, index) => {
      const weft_weight = getValues(`weft_weight_${index}`) ?? 0;
      totalWana += parseFloat(weft_weight);
    });

    setTana(totalTana);
    setWana(totalWana);
  };

  const calculateWarpingWeight = (indexValue) => {
    const tars = parseFloat(getValues(`tars_${indexValue}`));
    const tpm = parseFloat(getValues(`warping_tpm_${indexValue}`));
    const yarn_company = getValues(`yarn_stock_company_id_${indexValue}`);
    let denier;

    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_details = [] } = ysc;
      denier = yarn_details?.find(
        ({ yarn_company_id }) => yarn_company_id === parseInt(yarn_company)
      ).yarn_denier;
      if (denier) {
        return;
      }
    });

    if (tars && tpm && denier) {
      if (tpm !== 0) {
        const A = (tpm * 0.0075) / 100;
        const B = A * denier;
        const C = B + denier;
        const D = (C * tars * 106) / 9000000;

        setValue(`warping_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      } else {
        const D = (denier * tars * 106) / 9000000;
        setValue(`warping_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      }
    }
  };

  const calculateWeftWeight = (indexValue) => {
    const pano = parseFloat(getValues(`pano_${indexValue}`));
    const peak = parseFloat(getValues(`peak_${indexValue}`));
    const tpm = parseFloat(getValues(`weft_tpm_${indexValue}`));
    // const read = parseFloat(getValues(`read_${indexValue}`));
    const yarn_company = getValues(`weft_yarn_stock_company_id_${indexValue}`);
    let denier;

    yscdListRes?.yarnCompanyList?.forEach((ysc) => {
      const { yarn_details = [] } = ysc;
      denier = yarn_details?.find(
        ({ yarn_company_id }) => yarn_company_id === parseInt(yarn_company)
      ).yarn_denier;
      if (denier) {
        return;
      }
    });

    if (pano && peak && tpm && denier) {
      if (tpm !== 0) {
        const A = (tpm * 0.0075) / 100;
        const B = A * denier;
        const C = B + denier;
        const D = (C * pano * peak * 106) / 9000000;

        setValue(`weft_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      } else {
        const D = (denier * pano * peak * 106) / 9000000;
        setValue(`weft_weight_${indexValue}`, D.toFixed(3));
        calculateTanaWana();
      }
    }
  };

  useEffect(() => {
    if(inHouseQualityDetail){
      setQualityNamesData((prev) => {
        return [
          ...prev,
          {
            id: inHouseQualityDetail.quality.id,
            quality_name: inHouseQualityDetail.quality.quality_name,
            quality_weight: inHouseQualityDetail.quality.quality_weight,
          }
        ]
      })

      setOptions([
        {
          label: inHouseQualityDetail.quality.quality_name,
          value: inHouseQualityDetail.quality.id,
        }
      ]);

      const { 
          id,
          // quality_name, 
          quality_group, 
          machine_name, 
          design_no,
          yarn_type,
          licence_meter,
          vat_hsn_no,
          tpm_z,
          tpm_s,
          weight_from,
          weight_to,
          production_rate,
          max_taka,
          require_non_pasarela_beam,
          require_pasarela_beam,
          inhouse_production_types,
          inhouse_beam_rate,
          inhouse_waraping_details,
          inhouse_weft_details,

          need_quality_name_in_challan,
          need_quality_group_in_challan,
          need_design_no_in_challan,
          // need_weight_in_challan
      } = inHouseQualityDetail.quality;

      setNeedQualityNameInChallan(need_quality_name_in_challan);
      setNeedQualityGroupInChallan(need_quality_group_in_challan);
      setNeedDesignNoInChallan(need_design_no_in_challan);

      setIsTaarPasariaRate(inhouse_beam_rate.is_taar_pasaria_rate);
      setIsMeterBeamMakerPrimary(inhouse_beam_rate.is_meter_beam_maker_primary);
      setIsMeterBeamMakerSecondary(inhouse_beam_rate.is_meter_beam_maker_secondary);
      setIsTaarBeamPissingSecondary(inhouse_beam_rate.is_taar_beam_pissing_secondary);

      inhouse_production_types.forEach(item => {
        if(item.production_type === PRODUCTION_TYPE.type1){
          setProductionType1(true);
        }
        if(item.production_type === PRODUCTION_TYPE.type2){
          setProductionType2(true);
        }
        if(item.production_type === PRODUCTION_TYPE.type3){
          setProductionType3(true);
        }
      })
  
      let inHouseWarapingDetails = {}
      inhouse_waraping_details.forEach((item, index) => {
        inHouseWarapingDetails[`yarn_stock_company_id_${index}`] = item.yarn_stock_company_id;
        inHouseWarapingDetails[`tars_${index}`] = item.tars;
        inHouseWarapingDetails[`warping_tpm_${index}`] = item.tpm;
        inHouseWarapingDetails[`warping_weight_${index}`] = item.warping_weight;
        inHouseWarapingDetails[`is_primary_${index}`] = item.is_primary;
      })

      let inhouseWeftDetails = {}
      inhouse_weft_details.forEach((item, index) => {
        inhouseWeftDetails[`weft_yarn_stock_company_id_${index}`] = item.yarn_stock_company_id;
        inhouseWeftDetails[`pano_${index}`] = item.pano;
        inhouseWeftDetails[`peak_${index}`] = item.peak;
        inhouseWeftDetails[`dobby_rpm_${index}`] = item.dobby_rpm;
        inhouseWeftDetails[`production_per_day_${index}`] = item.production_per_day;
        inhouseWeftDetails[`read_${index}`] = item.read;
        inhouseWeftDetails[`weft_tpm_${index}`] = item.tpm;
        inhouseWeftDetails[`weft_weight_${index}`] = item.weft_weight;
      })
  
      reset({
          quality_name: id,
          quality_group,
          machine_name,
          design_no,
          yarn_type,
          licence_meter,
          vat_hsn_no,
          tpm_z,
          tpm_s,
          weight_from,
          weight_to,
          production_rate,
          max_taka,
          beam_spreader_pasaria_rate_taar: inhouse_beam_rate.pasaria_rate,
          beam_maker_primary_meter: inhouse_beam_rate.beam_maker_primary,
          beam_maker_secondary_meter: inhouse_beam_rate.beam_maker_secondary,
          beam_pissing_secondary_taar: inhouse_beam_rate.beam_pissing_secondary,
          ...inHouseWarapingDetails,
          ...inhouseWeftDetails,
          require_pasarela_beam,
          require_non_pasarela_beam
      })
    }
  }, [inHouseQualityDetail, reset])

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Update New Quality</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {/* Quality Details Card */}
        <Card style={{ margin: "1rem 0px" }}>
          <h2 className="m-0 text-primary">Quality Details:</h2>
          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={6}>
              <Form.Item
                // label="Quality Name"
                label={
                  <span>
                    Quality Name &nbsp;
                    <Checkbox
                      checked={needQualityNameInChallan}
                      onChange={(e) =>
                        setNeedQualityNameInChallan(e.target.checked)
                      }
                    />
                  </span>
                }
                name="quality_name"
                validateStatus={errors.quality_name ? "error" : ""}
                help={errors.quality_name && errors.quality_name.message}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="quality_name"
                  render={({ field }) => {
                    return (
                      <Select
                        showSearch
                        {...field}
                        placeholder="Search Quality"
                        labelInValue
                        allowClear
                        filterOption={false}
                        value={field.value ? options?.find(option => field.value === option.value) : null}
                        onChange={(newValue) => {
                          field.onChange(newValue?.value);
                        }}
                        onSearch={(value) => {
                          searchQualityName(value);
                        }}
                        options={options}
                        //   filterOption={(inputValue, option) =>
                        //     // option.value
                        //     //     .toUpperCase()
                        //     //     .indexOf(inputValue.toUpperCase()) !== -1
                        //     option.value === inputValue
                        //   }
                      />
                    );
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span>
                    Quality Group &nbsp;
                    <Checkbox
                      checked={needQualityGroupInChallan}
                      onChange={(e) =>
                        setNeedQualityGroupInChallan(e.target.checked)
                      }
                    />
                  </span>
                }
                name="quality_group"
                validateStatus={errors.quality_group ? "error" : ""}
                help={errors.quality_group && errors.quality_group.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="quality_group"
                  render={({ field }) => {
                    return (
                      <Select
                        allowClear
                        placeholder="Select group"
                        {...field}
                        options={QUALITY_GROUP_LIST}
                      />
                    );
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label="Machine"
                name="machine_name"
                validateStatus={errors.machine_name ? "error" : ""}
                help={errors.machine_name && errors.machine_name.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="machine_name"
                  render={({ field }) => (
                    <Select
                      {...field}
                      allowClear
                      placeholder="Select Machine"
                      loading={isLoadingMachineList}
                      options={machineListRes?.rows?.map((machine) => ({
                        label: machine?.machine_name,
                        value: machine?.machine_name,
                      }))}
                      style={{
                        textTransform: "capitalize",
                      }}
                      dropdownStyle={{
                        textTransform: "capitalize",
                      }}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span>
                    Design No. &nbsp;{" "}
                    <Checkbox
                      checked={needDesignNoInChallan}
                      onChange={(e) =>
                        setNeedDesignNoInChallan(e.target.checked)
                      }
                    />
                  </span>
                }
                name="design_no"
                validateStatus={errors.design_no ? "error" : ""}
                help={errors.design_no && errors.design_no.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="design_no"
                  render={({ field }) => (
                    <Select
                      {...field}  
                      allowClear
                      placeholder="Select Design"
                      options={designNoOption}
                    />
                  )}
                />
              </Form.Item>
            </Col>

            {quality_name === 0 ? (
              <>
                <Col span={6}>
                  <Form.Item
                    label="Quality Name"
                    name="other_quality_name"
                    validateStatus={errors.other_quality_name ? "error" : ""}
                    help={
                      errors.other_quality_name &&
                      errors.other_quality_name.message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="other_quality_name"
                      render={({ field }) => (
                        <Input {...field} placeholder="60 GRAM" type="text" />
                      )}
                    />
                  </Form.Item>
                </Col>

                <Col span={5}>
                  <Form.Item
                    label="Quality Weight"
                    name="other_quality_weight"
                    validateStatus={errors.other_quality_weight ? "error" : ""}
                    help={
                      errors.other_quality_weight &&
                      errors.other_quality_weight.message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="other_quality_weight"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="5.6"
                          type="number"
                          min={0}
                          step={0.5}
                        />
                      )}
                    />
                  </Form.Item>
                </Col>

                <Col span={1}>
                  <Button
                    style={{ marginTop: "1.9rem" }}
                    icon={<CloseOutlined />}
                    type="primary"
                    onClick={() => {
                      setValue("quality_name", null);
                      setValue("other_quality_name", "");
                      setValue("other_quality_weight", "");
                    }}
                    className="flex-none"
                  />
                </Col>
              </>
            ) : (
              <>
                {/* <Col span={6}></Col>
                <Col span={6}></Col>
                <Col span={6}></Col> */}
              </>
            )}

            {design_no === 0 ? (
              <>
                <Col span={6}>
                  <Form.Item
                    label="Quality Design"
                    name="other_design_no"
                    validateStatus={errors.other_design_no ? "error" : ""}
                    help={
                      errors.other_design_no && errors.other_design_no.message
                    }
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="other_design_no"
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Quality Design"
                          type="text"
                        />
                      )}
                    />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <></>
            )}
          </Row>

          <Divider />

          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={8}>
              <Form.Item
                label="VAT HSN No."
                name="vat_hsn_no"
                validateStatus={errors.vat_hsn_no ? "error" : ""}
                help={errors.vat_hsn_no && errors.vat_hsn_no.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="vat_hsn_no"
                  render={({ field }) => (
                    <Input {...field} placeholder="5407" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Licence meter"
                name="licence_meter"
                validateStatus={errors.licence_meter ? "error" : ""}
                help={errors.licence_meter && errors.licence_meter.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="licence_meter"
                  render={({ field }) => (
                    <Input {...field} placeholder="120 METER" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Yarn Type"
                name="yarn_type"
                validateStatus={errors.yarn_type ? "error" : ""}
                help={errors.yarn_type && errors.yarn_type.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="yarn_type"
                  render={({ field }) => (
                    <Select
                      allowClear
                      placeholder="Select yarn type"
                      {...field}
                      options={YARN_TYPE_LIST}
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            {yarn_type === "z" || yarn_type === "s/z" ? (
              <>
                <Col span={8}>
                  <Form.Item
                    label="T.P.M.[z]"
                    name="tpm_z"
                    validateStatus={errors.tpm_z ? "error" : ""}
                    help={errors.tpm_z && errors.tpm_z.message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="tpm_z"
                      render={({ field }) => (
                        <Input type="number" {...field} placeholder="2704" />
                      )}
                    />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <></>
            )}
            {yarn_type === "s" || yarn_type === "s/z" ? (
              <>
                <Col span={8}>
                  <Form.Item
                    label="T.P.M.[s]"
                    name="tpm_s"
                    validateStatus={errors.tpm_s ? "error" : ""}
                    help={errors.tpm_s && errors.tpm_s.message}
                    required={true}
                    wrapperCol={{ sm: 24 }}
                  >
                    <Controller
                      control={control}
                      name="tpm_s"
                      render={({ field }) => (
                        <Input type="number" {...field} placeholder="2704" />
                      )}
                    />
                  </Form.Item>
                </Col>
              </>
            ) : (
              <></>
            )}
          </Row>

          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={8}>
              <Flex className="flex-row justify-between items-center w-full">
                <Form.Item
                  label={
                    <span>
                      Weight of 100 Mtr &nbsp;
                      <Checkbox
                        checked={qualityDetailWeightFix}
                        onChange={(e) =>
                          setQualityDetailWeightFix(e.target.checked)
                        }
                      />{" "}
                      Fix
                    </span>
                  }
                  name="weight_from"
                  validateStatus={errors.weight_from ? "error" : ""}
                  help={errors.weight_from && errors.weight_from.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="weight_from"
                    render={({ field }) => (
                      <Input type="number" {...field} placeholder="1.7" />
                    )}
                  />
                </Form.Item>
                To
                <Form.Item
                  label=" "
                  name="weight_to"
                  validateStatus={errors.weight_to ? "error" : ""}
                  help={errors.weight_to && errors.weight_to.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                  style={{ marginTop: "0px" }}
                >
                  <Controller
                    control={control}
                    name="weight_to"
                    render={({ field }) => (
                      <Input type="number" {...field} placeholder="6.700" />
                    )}
                  />
                </Form.Item>
              </Flex>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Production Rate"
                name="production_rate"
                validateStatus={errors.production_rate ? "error" : ""}
                help={errors.production_rate && errors.production_rate.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="production_rate"
                  render={({ field }) => (
                    <Input type="number" {...field} placeholder="1.55" />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Max Taka"
                name="max_taka"
                validateStatus={errors.max_taka ? "error" : ""}
                help={errors.max_taka && errors.max_taka.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="max_taka"
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      placeholder="Max taka in 1 beam"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={8}>
              {/* <Form.Item
                label="Production Type"
                name="production_type"
                validateStatus={errors.production_type ? "error" : ""}
                help={errors.production_type && errors.production_type.message}
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="production_type"
                  render={({ field }) => (
                    // <Radio.Group {...field}>
                    //   <Radio value={"taka(in house)"}>Taka (in house)</Radio>
                    //   <Radio value={"purchase/trading"}>Purchase/Trading</Radio>
                    //   <Radio value={"job"}>Job </Radio>
                    // </Radio.Group>
                    <Flex gap={10}>
                      <Checkbox />
                      Taka (in house)
                      <Checkbox />
                      Purchase/Trading
                      <Checkbox />
                      Job
                    </Flex>
                  )}
                /> 
              </Form.Item> */}
              <label htmlFor="">Production Type</label>
              <Flex gap={10}>
                <div>
                  <Checkbox checked={productionType1} /> &nbsp;Taka (in house){" "}
                </div>
                <div>
                  <Checkbox
                    checked={productionType2}
                    onChange={(e) => setProductionType2(e.target.checked)}
                  />{" "}
                  &nbsp;Purchase/Trading
                </div>
                <div>
                  <Checkbox
                    checked={productionType3}
                    onChange={(e) => setProductionType3(e.target.checked)}
                  />{" "}
                  &nbsp;Job
                </div>
              </Flex>
            </Col>
          </Row>
        </Card>

        {/* Beam Rate Card */}
        <Card style={{ margin: "1rem 0px" }}>
          <h2 className="m-0 text-primary">Beam Rate:</h2>

          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={6}>
              <Form.Item
                label={
                  <span>
                    Beam Spreader(Pasaria Rate) Taar &nbsp;
                    <Checkbox
                      checked={isTaarPasariaRate}
                      onChange={(e) => setIsTaarPasariaRate(e.target.checked)}
                    />
                  </span>
                }
                name="beam_spreader_pasaria_rate_taar"
                validateStatus={
                  errors.beam_spreader_pasaria_rate_taar ? "error" : ""
                }
                help={
                  errors.beam_spreader_pasaria_rate_taar &&
                  errors.beam_spreader_pasaria_rate_taar.message
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="beam_spreader_pasaria_rate_taar"
                  render={({ field }) => (
                    <>
                      <Input
                        type="number"
                        {...field}
                        placeholder="Rate per beam"
                      />
                    </>
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span>
                    Beam Maker (Primary) Meter &nbsp;
                    <Checkbox
                      checked={isMeterBeamMakerPrimary}
                      onChange={(e) =>
                        setIsMeterBeamMakerPrimary(e.target.checked)
                      }
                    />
                  </span>
                }
                name="beam_maker_primary_meter"
                validateStatus={errors.beam_maker_primary_meter ? "error" : ""}
                help={
                  errors.beam_maker_primary_meter &&
                  errors.beam_maker_primary_meter.message
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="beam_maker_primary_meter"
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      placeholder="Rate Per Taka"
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span>
                    Beam Maker (Secondary) Meter &nbsp;
                    <Checkbox
                      checked={isMeterBeamMakerSecondary}
                      onChange={(e) =>
                        setIsMeterBeamMakerSecondary(e.target.checked)
                      }
                    />
                  </span>
                }
                name="beam_maker_secondary_meter"
                validateStatus={
                  errors.beam_maker_secondary_meter ? "error" : ""
                }
                help={
                  errors.beam_maker_secondary_meter &&
                  errors.beam_maker_secondary_meter.message
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="beam_maker_secondary_meter"
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      placeholder="Rate Per Taka"
                    />
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={
                  <span>
                    2nd beam pissing (Secondary) Taar &nbsp;
                    <Checkbox
                      checked={isTaarBeamPissingSecondary}
                      onChange={(e) =>
                        setIsTaarBeamPissingSecondary(e.target.checked)
                      }
                    />
                  </span>
                }
                name="beam_pissing_secondary_taar"
                validateStatus={
                  errors.beam_pissing_secondary_taar ? "error" : ""
                }
                help={
                  errors.beam_pissing_secondary_taar &&
                  errors.beam_pissing_secondary_taar.message
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="beam_pissing_secondary_taar"
                  render={({ field }) => (
                    <Input
                      type="number"
                      {...field}
                      placeholder="Rate per beam"
                    />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Warping Detail[Tana]  */}
        <Card style={{ margin: "1rem 0px" }}>
          <h2 className="m-0 text-primary">Warping Detail[Tana]:</h2>

          {warpingFormArray.length
            ? warpingFormArray.map((field, index) => {
                return (
                  <>
                    <Row
                      key={field + "_field_warping"}
                      gutter={18}
                      style={{
                        padding: "12px",
                      }}
                    >
                      <Col span={6}>
                        <Form.Item
                          label={"Denier/Count"}
                          name={`yarn_stock_company_id_${index}`}
                          validateStatus={
                            errors[`yarn_stock_company_id_${index}`]
                              ? "error"
                              : ""
                          }
                          help={
                            errors[`yarn_stock_company_id_${index}`] &&
                            errors[`yarn_stock_company_id_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`yarn_stock_company_id_${index}`}
                            render={({ field }) => {
                              return (
                                <Select
                                  {...field}
                                  allowClear
                                  loading={isLoadingYSCDList}
                                  placeholder="Select denier"
                                  options={denierOptions}
                                  onChange={(selectedValue) => {
                                    field.onChange(selectedValue);
                                    calculateWarpingWeight(index);
                                  }}
                                />
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item
                          label={"Tar/Ends"}
                          name={`tars_${index}`}
                          validateStatus={
                            errors[`tars_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`tars_${index}`] &&
                            errors[`tars_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`tars_${index}`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                placeholder="5560"
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (e.target.value === "") {
                                    setValue(`warping_tpm_${index}`, "");
                                    setValue(`warping_weight_${index}`, "");
                                  } else {
                                    calculateWarpingWeight(index);
                                  }
                                }}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item
                          label={"TPM"}
                          name={`warping_tpm_${index}`}
                          validateStatus={
                            errors[`warping_tpm_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`warping_tpm_${index}`] &&
                            errors[`warping_tpm_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`warping_tpm_${index}`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                placeholder="62.00"
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateWarpingWeight(index);
                                }}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={4}>
                        <Form.Item
                          label={"Weight[100Mtr]"}
                          name={`warping_weight_${index}`}
                          validateStatus={
                            errors[`warping_weight_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`warping_weight_${index}`] &&
                            errors[`warping_weight_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`warping_weight_${index}`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                placeholder="62.00"
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item
                          label={"Beam Type"}
                          name={`is_primary_${index}`}
                          validateStatus={
                            errors[`is_primary_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`is_primary_${index}`] &&
                            errors[`is_primary_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`is_primary_${index}`}
                            render={({ field }) => {
                              return (
                                <Checkbox
                                  {...field}
                                  defaultChecked={true}
                                  checked={field.value}
                                >
                                  {" "}
                                  P/S{" "}
                                </Checkbox>
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>

                      {warpingFormArray.length > 1 && (
                        <Col span={1}>
                          <Button
                            style={{ marginTop: "1.9rem" }}
                            icon={<DeleteOutlined />}
                            type="primary"
                            onClick={deleteWarpingDetailRow.bind(null, field)}
                            className="flex-none"
                          />
                        </Col>
                      )}

                      {index === warpingFormArray.length - 1 && (
                        <Col span={1}>
                          <Button
                            style={{ marginTop: "1.9rem" }}
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={addWarpingDetailRow.bind(null, index)}
                            className="flex-none"
                          />
                        </Col>
                      )}
                    </Row>

                    <div>
                      <Typography>
                        Total Weight [ Tana + Wana ] = {tana} + {wana} ={" "}
                        {(tana + wana).toFixed(3)}
                      </Typography>
                    </div>
                  </>
                );
              })
            : null}
        </Card>

        {/* Weft Detail[Wana]  */}
        <Card style={{ margin: "1rem 0px" }}>
          <h2 className="m-0 text-primary">Weft Detail[Wana]:</h2>

          {weftFormArray.length
            ? weftFormArray.map((field, index) => {
                return (
                  <>
                    <Row
                      key={field + "_field_weft"}
                      gutter={18}
                      style={{
                        padding: "12px",
                      }}
                    >
                      <Col span={5}>
                        <Form.Item
                          label={"Denier/Count"}
                          name={`weft_yarn_stock_company_id_${index}`}
                          validateStatus={
                            errors[`weft_yarn_stock_company_id_${index}`]
                              ? "error"
                              : ""
                          }
                          help={
                            errors[`weft_yarn_stock_company_id_${index}`] &&
                            errors[`weft_yarn_stock_company_id_${index}`]
                              .message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`weft_yarn_stock_company_id_${index}`}
                            render={({ field }) => {
                              return (
                                <Select
                                  allowClear
                                  {...field}
                                  loading={isLoadingYSCDList}
                                  placeholder="Select denier"
                                  options={denierOptions}
                                  onChange={(selectedValue) => {
                                    field.onChange(selectedValue);
                                    calculateWeftWeight(index);
                                  }}
                                />
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          label={"Pano"}
                          name={`pano_${index}`}
                          validateStatus={
                            errors[`pano_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`pano_${index}`] &&
                            errors[`pano_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`pano_${index}`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                placeholder="54.00"
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (e.target.value === "") {
                                    setValue(`weft_tpm_${index}`, "");
                                    setValue(`weft_weight_${index}`, "");
                                  } else {
                                    calculateWeftWeight(index);
                                  }
                                }}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          label={"Peak"}
                          name={`peak_${index}`}
                          validateStatus={
                            errors[`peak_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`peak_${index}`] &&
                            errors[`peak_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`peak_${index}`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                placeholder="62.00"
                                onChange={(e) => {
                                  field.onChange(e);
                                  if (e.target.value === "") {
                                    setValue(`weft_tpm_${index}`, "");
                                    setValue(`weft_weight_${index}`, "");
                                  } else {
                                    calculateWeftWeight(index);
                                  }
                                }}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item
                          label={"Dobby RPM"}
                          name={`dobby_rpm_${index}`}
                          validateStatus={
                            errors[`dobby_rpm_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`dobby_rpm_${index}`] &&
                            errors[`dobby_rpm_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`dobby_rpm_${index}`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                placeholder="RPM"
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item
                          label={"Production/Day"}
                          name={`production_per_day_${index}`}
                          validateStatus={
                            errors[`production_per_day_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`production_per_day_${index}`] &&
                            errors[`production_per_day_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`production_per_day_${index}`}
                            render={({ field }) => {
                              return (
                                <Input
                                  {...field}
                                  type="number"
                                  placeholder="10"
                                />
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          label={"Read"}
                          name={`read_${index}`}
                          validateStatus={
                            errors[`read_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`read_${index}`] &&
                            errors[`read_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`read_${index}`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                placeholder="62.00"
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={2}>
                        <Form.Item
                          label={"TPM"}
                          name={`weft_tpm_${index}`}
                          validateStatus={
                            errors[`weft_tpm_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`weft_tpm_${index}`] &&
                            errors[`weft_tpm_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`weft_tpm_${index}`}
                            render={({ field }) => (
                              <Input
                                {...field}
                                type="number"
                                placeholder="62.00"
                                onChange={(e) => {
                                  field.onChange(e);
                                  calculateWeftWeight(index);
                                }}
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={3}>
                        <Form.Item
                          label={"Weight[100Mtr]"}
                          name={`weft_weight_${index}`}
                          validateStatus={
                            errors[`weft_weight_${index}`] ? "error" : ""
                          }
                          help={
                            errors[`weft_weight_${index}`] &&
                            errors[`weft_weight_${index}`].message
                          }
                          required={true}
                          wrapperCol={{ sm: 24 }}
                        >
                          <Controller
                            control={control}
                            name={`weft_weight_${index}`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                {...field}
                                placeholder="62.00"
                              />
                            )}
                          />
                        </Form.Item>
                      </Col>

                      {weftFormArray.length > 1 && (
                        <Col span={1}>
                          <Button
                            style={{ marginTop: "1.9rem" }}
                            icon={<DeleteOutlined />}
                            type="primary"
                            onClick={deleteWeftDetailRow.bind(null, field)}
                            className="flex-none"
                          />
                        </Col>
                      )}

                      {index === weftFormArray.length - 1 && (
                        <Col span={1}>
                          <Button
                            style={{ marginTop: "1.9rem" }}
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={addWeftDetailRow.bind(null, index)}
                            className="flex-none"
                          />
                        </Col>
                      )}
                    </Row>

                    <div>
                      <Typography>
                        Total Weight [ Tana + Wana ] = {tana} + {wana} ={" "}
                        {tana + wana}
                      </Typography>
                    </div>
                  </>
                );
              })
            : null}
        </Card>

        {/* Require Ready Beam */}
        <Card style={{ margin: "1rem 0px" }}>
          <h2 className="m-0 text-primary">Require Ready Beam:</h2>

          <Row
            gutter={18}
            style={{
              padding: "12px",
            }}
          >
            <Col span={6}>
              <Form.Item
                label={"Require everyday non pasarela beam"}
                name="require_non_pasarela_beam"
                validateStatus={errors.require_non_pasarela_beam ? "error" : ""}
                help={
                  errors.require_non_pasarela_beam &&
                  errors.require_non_pasarela_beam.message
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="require_non_pasarela_beam"
                  render={({ field }) => (
                    <>
                      <Input type="number" {...field} placeholder="1" />
                    </>
                  )}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                label={"Require everyday pasarela beam"}
                name="require_pasarela_beam"
                validateStatus={errors.require_pasarela_beam ? "error" : ""}
                help={
                  errors.require_pasarela_beam &&
                  errors.require_pasarela_beam.message
                }
                required={true}
                wrapperCol={{ sm: 24 }}
              >
                <Controller
                  control={control}
                  name="require_pasarela_beam"
                  render={({ field }) => (
                    <Input type="number" {...field} placeholder="1" />
                  )}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Flex>
      </Form>

      <DevTool control={control} />
    </div>
  );
};

export default UpdateInHouseQuality;
