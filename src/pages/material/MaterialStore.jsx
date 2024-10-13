import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Input, message, Spin } from "antd";
import {
  getMaterialStoreListRequest,
  updateMaterialStoreRequest,
} from "../../api/requests/material";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { GlobalContext } from "../../contexts/GlobalContext";
import { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const MaterialStore = () => {
  const queryClient = useQueryClient();
  const { companyId } = useContext(GlobalContext);
  const [numOfFields, setNumOfFields] = useState([]);

  const { mutateAsync: updateMaterialStore, isPending } = useMutation({
    mutationFn: async (data) => {
      const res = await updateMaterialStoreRequest({
        data,
        params: {
          company_id: companyId,
        },
      });
      return res.data;
    },
    mutationKey: ["update", "material", "store"],
    onSuccess: (res) => {
      queryClient.invalidateQueries([
        "get",
        "millgine-report",
        "list",
        {
          company_id: companyId,
        },
      ]);
      const successMessage = res?.message;
      if (successMessage) {
        message.success(successMessage);
      }
    },
    onError: (error) => {
      const errorMessage = error?.response?.data?.message || error.message;
      message.error(errorMessage);
    },
  });

  const onSubmit = async (data) => {
    const payload = numOfFields.map((item) => {
      return {
        particular_name: data[`particular_name_${item}`],
        total: data[`total_${item}`],
        in_use: data[`in_use_${item}`],
        empty: data[`empty_${item}`],
      };
    });

    await updateMaterialStore(payload);
  };

  const { control, handleSubmit, setValue, getValues, resetField } = useForm({
    defaultValues: {},
  });

  const { data: materialStoreList, isLoading } = useQuery({
    queryKey: [
      "get",
      "millgine-report",
      "list",
      {
        company_id: companyId,
      },
    ],
    queryFn: async () => {
      const res = await getMaterialStoreListRequest({
        params: {
          company_id: companyId,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (!isLoading) {
      if (materialStoreList && materialStoreList?.materialList?.length) {
        const numOfFields = Array.from(
          { length: materialStoreList?.materialList?.length || 0 },
          (_, i) => i
        );

        setNumOfFields(numOfFields);
        materialStoreList?.materialList?.forEach((item, index) => {
          setValue(`id_${index}`, item.id);
          setValue(`particular_name_${index}`, item.particular_name);
          setValue(`total_${index}`, item.total);
          setValue(`in_use_${index}`, item.in_use);
          setValue(`empty_${index}`, item.empty);
        });
      } else {
        setNumOfFields([0, 1]);

        // setValue(`id_${index}`, 0);
        setValue(`particular_name_${0}`, "Primary Beam Pipe");
        setValue(`total_${0}`, 0);
        setValue(`in_use_${0}`, 0);
        setValue(`empty_${0}`, 0);

        setValue(`particular_name_${1}`, "Secondary Beam Pipe");
        setValue(`total_${1}`, 0);
        setValue(`in_use_${1}`, 0);
        setValue(`empty_${1}`, 0);
      }
    }
  }, [isLoading, materialStoreList, setValue]);

  const calculateEmpty = (fieldNo) => {
    const total = getValues(`total_${fieldNo}`) || 0;
    const inUse = getValues(`in_use_${fieldNo}`) || 0;
    const empty = total - inUse;

    setValue(`empty_${fieldNo}`, empty);
  };

  const resetEntry = (fieldNo) => {
    resetField(`id_${fieldNo}`, "");
    resetField(`particular_name_${fieldNo}`, "");
    resetField(`total_${fieldNo}`, "");
    resetField(`in_use_${fieldNo}`, "");
    resetField(`empty_${fieldNo}`, "");
  };

  const deleteEntry = async (fieldNo) => {
    const id = getValues(`id_${fieldNo}`);
    const data = materialStoreList?.materialList?.filter(
      (item) => item.id !== id
    );
    const payload = data.map((item) => {
      return {
        particular_name: item.particular_name,
        total: item.total,
        in_use: item.in_use,
        empty: item.empty,
      };
    });

    await updateMaterialStore(payload);
    resetEntry(fieldNo);
  };

  const addNewEntry = () => {
    let nextNo = numOfFields.length;
    setNumOfFields((prev) => {
      return [...prev, nextNo];
    });
    resetEntry(nextNo);
  };

  return (
    <Card style={{ width: "70%", margin: "auto" }}>
      <div className="flex items-center justify-between gap-5 mx-3 mb-3">
        <h2 className="m-0 text-primary">Material</h2>

        <Flex align="center" gap={20}>
          <Button type="link" onClick={addNewEntry}>
            <PlusCircleOutlined />
          </Button>
          <Button
            style={{ backgroundColor: "green", color: "#fff" }}
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            Save
          </Button>
        </Flex>
      </div>

      <br />
      {isLoading ? (
        <Flex align="center">
          <Spin />
        </Flex>
      ) : (
        <table className="custom-table">
          <thead>
            <tr>
              <th>Particular</th>
              <th style={{ width: "100px" }}>Total</th>
              <th style={{ width: "100px" }}>In Use</th>
              <th style={{ width: "100px" }}>Empty</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {numOfFields && numOfFields.length ? (
              numOfFields?.map((item) => {
                const pname = getValues(`particular_name_${item}`)
                  ? getValues(`particular_name_${item}`).toLowerCase()
                  : "";
                const isDisable =
                  pname.includes("primary") || pname.includes("secondary");

                return (
                  <tr key={item + "_material_list"}>
                    <td>
                      <Controller
                        control={control}
                        name={`particular_name_${item}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="Particular name"
                            disabled={isDisable}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <Controller
                        control={control}
                        name={`total_${item}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="100"
                            type="number"
                            onChange={(e) => {
                              field.onChange(e);
                              calculateEmpty(item);
                            }}
                            disabled={isDisable}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <Controller
                        control={control}
                        name={`in_use_${item}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            placeholder="100"
                            onChange={(e) => {
                              field.onChange(e);
                              calculateEmpty(item);
                            }}
                            disabled={isDisable}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <Controller
                        control={control}
                        name={`empty_${item}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            placeholder="100"
                            readOnly
                            disabled={isDisable}
                          />
                        )}
                      />
                    </td>
                    <td style={{ textAlign: "center", width: "60px" }}>
                      <Controller
                        control={control}
                        name={`id_${item}`}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="hidden"
                            style={{ width: "20px" }}
                            disabled={isDisable}
                          />
                        )}
                      />
                      {!isDisable && (
                        <Button
                          danger
                          style={{ width: "100%" }}
                          onClick={() => deleteEntry(item)}
                        >
                          <DeleteOutlined />
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td>No Data Found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default MaterialStore;
