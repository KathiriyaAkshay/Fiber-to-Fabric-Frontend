import { ArrowLeftOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Tag,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useContext, useEffect, useMemo, useState } from "react";
import { GlobalContext } from "../../../../contexts/GlobalContext";
import { getInHouseQualityListRequest } from "../../../../api/requests/qualityMaster";
import { getCompanyMachineListRequest } from "../../../../api/requests/machine";
import dayjs from "dayjs";
import { BEAM_TYPE_OPTION_LIST } from "../../../../constants/orderMaster";
import {
  getDropdownSupplierListRequest,
  getVehicleUserListRequest,
} from "../../../../api/requests/users";
import {
  getBeamSaleChallanByIdRequest,
  updateBeamSaleChallanRequest,
} from "../../../../api/requests/sale/challan/beamSale";

const addJobTakaSchemaResolver = yupResolver(
  yup.object().shape({
    vehicle_id: yup.string().required("Please enter vehicle no."),
    challan_no: yup.string().required("Please enter challan no."),
    challan_date: yup.string().required("Please enter challan date."),
    supplier_name: yup.string().required("Please select supplier name."),
    supplier_id: yup.string().required("Please select supplier company name."),
    machine_name: yup.string().required("Please select machine."),
    // quality_group: yup.string().required("Please select quality group."),
    beam_type: yup.string().required("Please select beam type."),
    quality_id: yup.string().required("Please select quality."),
    // power_cost_per_meter: yup
    //   .string()
    //   .required("Please enter power of cost per meter."),
    // delivery_charge: yup.string().required("Please enter delivery charge."),
  })
);

const UpdateBeamSent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();

  const { companyId } = useContext(GlobalContext);

  const [inhouseWarpIds, setInhouseWarpIds] = useState([]);
  const [beamLoadIds, setBeamLoadIds] = useState([]);
  const [beamTypeList, setBeamTypeList] = useState();

  function goBack() {
    navigate(-1);
  }

  const { data: beamSaleChallanDetail } = useQuery({
    queryKey: ["beamSale", "get", id, { company_id: companyId }],
    queryFn: async () => {
      const res = await getBeamSaleChallanByIdRequest({
        id,
        params: { company_id: companyId },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const { mutateAsync: updateBeamSent, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateBeamSaleChallanRequest({
        id,
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["update", "beam", "sale"],
    onSuccess: (res) => {
      queryClient.invalidateQueries(["beamSale", "list", companyId]);
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

  async function onSubmit(data) {
    if (!beamLoadIds.length) {
      message.error("At least one beam should be selected.");
      return;
    }
    const payload = {
      supplier_id: +data.supplier_id,
      vehicle_id: +data.vehicle_id,
      challan_no: data.challan_no,
      // createdAt: dayjs(data.challan_date).format("YYYY-MM-DD"),
      machine_name: data.machine_name,
      // quality_group: data.quality_group,
      beam_type: data.beam_type,
      quality_id: +data.quality_id,
      // delivery_charge: +(+data.delivery_charge).toFixed(2),
      // power_cost_per_meter: +(+data.power_cost_per_meter).toFixed(2),
      enter_weight: +data.enter_weight,
      total_meter: +data.total_meter,
      inhouse_warp_ids: inhouseWarpIds,
      beam_load_ids: beamLoadIds,
    };
    delete payload.challan_date;

    await updateBeamSent(payload);
  }

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    resetField,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      vehicle_id: null,
      challan_no: "",
      challan_date: dayjs(),
      supplier_name: null,
      supplier_id: null,
      machine_name: null,
      beam_type: null,
      quality_id: null,
      total_meter: 0,
      enter_weight: 0,
    },
    resolver: addJobTakaSchemaResolver,
  });
  const { machine_name, quality_id, supplier_name } = watch();

  // ------------------------------------------------------------------------------------------

  const { data: vehicleListRes, isLoading: isLoadingVehicleList } = useQuery({
    queryKey: [
      "vehicle",
      "list",
      { company_id: companyId, page: 0, pageSize: 99999 },
    ],
    queryFn: async () => {
      const res = await getVehicleUserListRequest({
        params: { company_id: companyId, page: 0, pageSize: 99999 },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
  });

  const {
    data: dropdownSupplierListRes,
    isLoading: isLoadingDropdownSupplierList,
  } = useQuery({
    queryKey: ["dropdown/supplier/list", { company_id: companyId }],
    queryFn: async () => {
      const res = await getDropdownSupplierListRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.supplierList;
    },
    enabled: Boolean(companyId),
  });

  const dropDownSupplierCompanyOption = useMemo(() => {
    if (
      supplier_name &&
      dropdownSupplierListRes &&
      dropdownSupplierListRes.length
    ) {
      const obj = dropdownSupplierListRes.filter((item) => {
        return item.supplier_name === supplier_name;
      })[0];

      return obj?.supplier_company?.map((item) => {
        return { label: item.supplier_company, value: item.supplier_id };
      });
    } else {
      return [];
    }
  }, [supplier_name, dropdownSupplierListRes]);

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

  const { data: dropDownQualityListRes, isLoading: dropDownQualityLoading } =
    useQuery({
      queryKey: [
        "dropDownQualityListRes",
        "list",
        {
          company_id: companyId,
          machine_name: machine_name,
          page: 0,
          pageSize: 99999,
          is_active: 1,
        },
      ],
      queryFn: async () => {
        if (machine_name) {
          const res = await getInHouseQualityListRequest({
            params: {
              company_id: companyId,
              machine_name: machine_name,
              page: 0,
              pageSize: 99999,
              is_active: 1,
            },
          });
          return res.data?.data;
        } else {
          return { row: [] };
        }
      },
      enabled: Boolean(companyId),
    });

  const weftDenierDetails = useMemo(() => {
    if (quality_id && dropDownQualityListRes?.rows?.length) {
      const selectedQuality = dropDownQualityListRes.rows.find(
        ({ id }) => id === quality_id
      );
      return selectedQuality.inhouse_weft_details;
    }
  }, [dropDownQualityListRes, quality_id]);

  //   useQuery({
  //     queryKey: [
  //       "pasarela",
  //       "beam",
  //       "list",
  //       {
  //         company_id: companyId,
  //         machine_name,
  //         quality_id,
  //         beam_type,
  //         quality_group,
  //       },
  //     ],
  //     queryFn: async () => {
  //       if (machine_name && quality_id && beam_type === "pasarela(primary)") {
  //         setBeamLoadIds([]);
  //         setBeamTypeList();
  //         resetField("total_weight");
  //         resetField("total_meter");
  //         const res = await getPasarelaBeamListRequest({
  //           params: {
  //             company_id: companyId,
  //             machine_name,
  //             quality_id,
  //             is_job: quality_group === "job" ? true : false,
  //           },
  //         });
  //         if (res.data?.data?.rows.length) {
  //           setBeamTypeList(
  //             res.data?.data?.rows.map((item) => {
  //               const obj =
  //                 item.non_pasarela_beam_detail ||
  //                 item.recieve_size_beam_detail ||
  //                 item.job_beam_receive_detail;
  //               return {
  //                 beam_load_id: item.id,
  //                 beam_no: item.beam_no,
  //                 ends_or_tars: obj.ends_or_tars,
  //                 pano: obj.pano,
  //                 taka: obj.taka,
  //                 meters: obj.meters,
  //                 weight: obj.net_weight,
  //               };
  //             })
  //           );
  //         } else {
  //           setBeamTypeList([]);
  //         }
  //         // return res.data?.data;
  //       }
  //     },
  //     enabled: Boolean(companyId),
  //     initialData: { rows: [] },
  //   });

  //   useQuery({
  //     queryKey: [
  //       "non-pasarela",
  //       "beam",
  //       "list",
  //       {
  //         company_id: companyId,
  //         machine_name,
  //         quality_id,
  //         beam_type,
  //         quality_group,
  //       },
  //     ],
  //     queryFn: async () => {
  //       if (
  //         machine_name &&
  //         quality_id &&
  // //   !beam_type &&
  //         beam_type !== "pasarela(primary)"
  //       ) {
  //         setBeamLoadIds([]);
  //         setBeamTypeList();
  //         resetField("total_weight");
  //         resetField("total_meter");
  //         const params = {
  //           company_id: companyId,
  //           machine_name,
  //           quality_id,
  //           is_job: quality_group === "job" ? true : false,
  //         };
  //         if (beam_type === "non-pasarela(secondary)") {
  //           params.is_secondary = true;
  //         }
  //         const res = await getNonPasarelaBeamListRequest({ params });
  //         setBeamTypeList(res.data?.data?.rows);
  //       }
  //     },
  //     enabled: Boolean(companyId),
  //     initialData: { rows: [] },
  //   });

  const handleInhouseWarpIdHandler = (value, id) => {
    if (value) {
      setInhouseWarpIds((prev) => {
        return [...prev, id];
      });
    } else {
      setInhouseWarpIds((prev) => {
        return [...prev.filter((i) => i !== id)];
      });
    }
  };

  const beamLoadIdHandler = (value, id, meter = 0, weight = 0) => {
    const totalMeter = +getValues("total_meter") || 0;
    const totalWeight = +getValues("total_weight") || 0;
    if (value) {
      setBeamLoadIds((prev) => {
        return [...prev, id];
      });
      setValue("total_meter", totalMeter + meter);
      setValue("total_weight", totalWeight + weight);
    } else {
      setBeamLoadIds((prev) => {
        return [...prev.filter((i) => i !== id)];
      });
      setValue("total_meter", totalMeter - meter);
      setValue("total_weight", totalWeight - weight);
    }
  };

  const allCheckHandler = (value) => {
    if (value) {
      setBeamLoadIds(beamTypeList.map(({ beam_load_id }) => beam_load_id));
      let totalWeight = 0;
      let totalMeter = 0;
      beamTypeList.forEach(({ weight = 0, meters = 0 }) => {
        totalWeight += +weight;
        totalMeter += +meters;
      });

      setValue("total_weight", totalWeight);
      setValue("total_meter", totalMeter);
    } else {
      setBeamLoadIds([]);
      setValue("total_weight", 0);
      setValue("total_meter", 0);
    }
  };

  useEffect(() => {
    if (beamSaleChallanDetail) {
      const {
        vehicle_id,
        challan_no,
        createdAt,
        supplier: { supplier_name },
        supplier_id,
        machine_name,
        quality_id,
        beam_type,
        total_meter,
        enter_weight,
        beam_sale_warp_deniers,
        beam_sale_details,
      } = beamSaleChallanDetail;

      setInhouseWarpIds(() => {
        return beam_sale_warp_deniers.map(
          ({ inhouse_warp_id }) => inhouse_warp_id
        );
      });
      setBeamLoadIds(() => {
        return beam_sale_details.map(({ beam_load_id }) => beam_load_id);
      });

      setBeamTypeList(
        beam_sale_details?.map((item) => {
          const obj =
            item.loaded_beam.non_pasarela_beam_detail ||
            item.loaded_beam.recieve_size_beam_detail ||
            item.loaded_beam.job_beam_receive_detail;
          return {
            beam_load_id: item.beam_load_id,
            beam_no: obj.beam_no,
            ends_or_tars: obj.ends_or_tars,
            pano: obj.pano,
            taka: obj.taka,
            meters: obj.meters,
            weight: obj.net_weight,
          };
        })
      );

      reset({
        vehicle_id,
        challan_no,
        challan_date: dayjs(createdAt),
        supplier_name,
        supplier_id,
        machine_name,
        beam_type,
        quality_id,
        enter_weight,
        total_meter,
        total_weight: 0,
      });
    }
  }, [beamSaleChallanDetail, reset]);

  return (
    <div className="flex flex-col p-4">
      <div className="flex items-center gap-5">
        <Button onClick={goBack}>
          <ArrowLeftOutlined />
        </Button>
        <h3 className="m-0 text-primary">Edit Sale Challan</h3>
      </div>
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        {weftDenierDetails && weftDenierDetails.length ? (
          <>
            <h3> Select Warp Denier</h3>
            <Row
              gutter={18}
              style={{
                padding: "12px",
              }}
            >
              {weftDenierDetails.map(
                ({ id, weft_weight, yarn_stock_company }, index) => {
                  const { yarn_denier, filament, luster_type, yarn_color } =
                    yarn_stock_company;

                  return (
                    <Col key={index} span={5}>
                      <Checkbox
                        checked={inhouseWarpIds?.includes(id)}
                        onChange={(e) =>
                          handleInhouseWarpIdHandler(e.target.checked, id)
                        }
                      >
                        <Tag color="green">[{weft_weight}]</Tag>
                        {`${yarn_denier}D/${filament}F (${luster_type} - ${yarn_color})`}
                      </Checkbox>
                    </Col>
                  );
                }
              )}
            </Row>
            <Divider />
          </>
        ) : null}

        <Row
          gutter={18}
          style={{
            padding: "12px",
            justifyContent: "flex-end",
          }}
        >
          <Col span={6}>
            <Form.Item
              label="Challan No"
              name="challan_no"
              validateStatus={errors.challan_no ? "error" : ""}
              help={errors.challan_no && errors.challan_no.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_no"
                render={({ field }) => (
                  <Input {...field} disabled placeholder="Challan No" />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="vehicle"
              name="vehicle_id"
              validateStatus={errors.vehicle_id ? "error" : ""}
              help={errors.vehicle_id && errors.vehicle_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="vehicle_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingVehicleList}
                    placeholder="Select Vehicle"
                    options={vehicleListRes?.vehicleList?.rows?.map(
                      (vehicle) => ({
                        label:
                          vehicle.first_name +
                          " " +
                          vehicle.last_name +
                          " " +
                          `| ( ${vehicle?.username})`,
                        value: vehicle.id,
                      })
                    )}
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
              label="Challan Date"
              name="challan_date"
              validateStatus={errors.challan_date ? "error" : ""}
              help={errors.challan_date && errors.challan_date.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="challan_date"
                render={({ field }) => (
                  <DatePicker {...field} disabled style={{ width: "100%" }} />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Supplier Name"
              name="supplier_name"
              validateStatus={errors.supplier_name ? "error" : ""}
              help={errors.supplier_name && errors.supplier_name.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_name"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingDropdownSupplierList}
                    placeholder="Select Supplier"
                    options={dropdownSupplierListRes?.map((supervisor) => ({
                      label: supervisor?.supplier_name,
                      value: supervisor?.supplier_name,
                    }))}
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                    onChange={(value) => {
                      field.onChange(value);
                      resetField("supplier_id");
                    }}
                    disabled
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
          <Col span={4}>
            <Form.Item
              label="Supplier Company"
              name="supplier_id"
              validateStatus={errors.supplier_id ? "error" : ""}
              help={errors.supplier_id && errors.supplier_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="supplier_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    loading={isLoadingDropdownSupplierList}
                    placeholder="Select Supplier Company"
                    options={dropDownSupplierCompanyOption}
                    style={{
                      textTransform: "capitalize",
                    }}
                    dropdownStyle={{
                      textTransform: "capitalize",
                    }}
                    disabled
                  />
                )}
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
                    placeholder="Select Machine Name"
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
                    onChange={(value) => {
                      field.onChange(value);
                      resetField("quality_id");
                    }}
                    disabled
                  />
                )}
              />
            </Form.Item>
          </Col>

          {/* <Col span={4}>
            <Form.Item
              label={"Quality Group"}
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
                      options={QUALITY_GROUP_OPTION_LIST}
                      onChange={(value) => {
                        field.onChange(value);
                        resetField("quality_id");
                      }}
                      disabled
                    />
                  );
                }}
              />
            </Form.Item>
          </Col> */}

          <Col span={6}>
            <Form.Item
              label="Select Quality"
              name="quality_id"
              validateStatus={errors.quality_id ? "error" : ""}
              help={errors.quality_id && errors.quality_id.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="quality_id"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Quality"
                      loading={dropDownQualityLoading}
                      options={
                        dropDownQualityListRes &&
                        dropDownQualityListRes?.rows?.map((item) => ({
                          value: item.id,
                          label: item.quality_name,
                        }))
                      }
                      disabled
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              label="Beam Type"
              name={`beam_type`}
              validateStatus={errors.beam_type ? "error" : ""}
              help={errors.beam_type && errors.beam_type.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="beam_type"
                render={({ field }) => {
                  return (
                    <Select
                      {...field}
                      placeholder="Select Beam type"
                      options={BEAM_TYPE_OPTION_LIST}
                      disabled
                    />
                  );
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {beamTypeList && (
          <table
            border={1}
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "center",
            }}
          >
            <thead>
              <tr>
                <td style={{ width: "50px" }}>
                  <Checkbox
                    onChange={(e) => allCheckHandler(e.target.checked)}
                  />
                </td>
                <td style={{ width: "150px" }}>Beam No</td>
                <td>Tar</td>
                <td>Pano</td>
                <td>Taka</td>
                <td>Meter</td>
              </tr>
            </thead>
            <tbody>
              {beamTypeList && beamTypeList?.length ? (
                beamTypeList?.map(
                  (
                    {
                      beam_load_id,
                      beam_no,
                      ends_or_tars,
                      pano,
                      taka,
                      meters,
                      weight,
                    },
                    index
                  ) => {
                    return (
                      <tr key={index}>
                        <td width={50}>
                          <Checkbox
                            checked={beamLoadIds?.includes(beam_load_id)}
                            onChange={(e) =>
                              beamLoadIdHandler(
                                e.target.checked,
                                beam_load_id,
                                meters,
                                weight
                              )
                            }
                          />
                        </td>
                        <td width={150}>{beam_no}</td>
                        <td>{ends_or_tars}</td>
                        <td>{pano}</td>
                        <td>{taka}</td>
                        <td>{meters}</td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  <td colSpan={6}>Not found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        <br />

        <Row
          gutter={18}
          style={{
            padding: "12px",
            justifyContent: "right",
          }}
        >
          {beamTypeList && (
            <>
              <Col span={4}>
                <Form.Item
                  label="Enter Weight"
                  name="enter_weight"
                  validateStatus={errors.enter_weight ? "error" : ""}
                  help={errors.enter_weight && errors.enter_weight.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="enter_weight"
                    render={({ field }) => (
                      <Input {...field} disabled type="number" />
                    )}
                  />
                </Form.Item>
              </Col>

              <Col span={4}>
                <Form.Item
                  label="Total Meter"
                  name="total_meter"
                  validateStatus={errors.total_meter ? "error" : ""}
                  help={errors.total_meter && errors.total_meter.message}
                  required={true}
                  wrapperCol={{ sm: 24 }}
                >
                  <Controller
                    control={control}
                    name="total_meter"
                    render={({ field }) => (
                      <Input {...field} disabled type="number" />
                    )}
                  />
                </Form.Item>
              </Col>
            </>
          )}

          {/* <Col span={4}>
            <Form.Item
              label="Delivery Charge"
              name="delivery_charge"
              validateStatus={errors.delivery_charge ? "error" : ""}
              help={errors.delivery_charge && errors.delivery_charge.message}
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="delivery_charge"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="Add Delivery charge"
                  />
                )}
              />
            </Form.Item>
          </Col> */}

          {/* <Col span={4}>
            <Form.Item
              label="Power Cost Per Meter"
              name="power_cost_per_meter"
              validateStatus={errors.power_cost_per_meter ? "error" : ""}
              help={
                errors.power_cost_per_meter &&
                errors.power_cost_per_meter.message
              }
              required={true}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="power_cost_per_meter"
                render={({ field }) => (
                  <Input {...field} type="number" placeholder="0.25" />
                )}
              />
            </Form.Item>
          </Col> */}
        </Row>

        <Flex gap={10} justify="flex-end">
          <Button type="primary" htmlType="submit" loading={isPending}>
            Update
          </Button>
        </Flex>
      </Form>
    </div>
  );
};

export default UpdateBeamSent;
