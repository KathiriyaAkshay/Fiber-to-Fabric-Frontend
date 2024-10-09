import { DeleteOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Input, message, Spin } from "antd";
import {
  getMaterialStoreListRequest,
  updateMaterialStoreRequest,
} from "../../api/requests/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  const { control, handleSubmit, setValue, getValues } = useForm({
    defaultValues: {},
  });

  const { data: materialStoreList, isFetching } = useQuery({
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
  });

  useEffect(() => {
    if (materialStoreList && materialStoreList?.materialList?.length) {
      const numOfFields = Array.from(
        { length: materialStoreList?.materialList?.length || 0 },
        (_, i) => i + 1
      );
      setNumOfFields(numOfFields);

      materialStoreList?.materialList?.forEach((item, index) => {
        setValue(`particular_name_${index + 1}`, item.particular_name);
        setValue(`total_${index + 1}`, item.total);
        setValue(`in_use_${index + 1}`, item.in_use);
        setValue(`empty_${index + 1}`, item.empty);
      });
    }
  }, [materialStoreList, setValue]);

  const calculateEmpty = (fieldNo) => {
    const total = getValues(`total_${fieldNo}`) || 0;
    const inUse = getValues(`in_use_${fieldNo}`) || 0;
    const empty = total - inUse;

    setValue(`empty_${fieldNo}`, empty);
  };

  const deleteEntry = (fieldNo) => {
    const numOfFieldsCopy = [...numOfFields.filter((item) => item !== fieldNo)];
    setNumOfFields([...numOfFieldsCopy]);
  };

  const addNewEntry = () => {
    const lastNo = numOfFields[numOfFields.length - 1];
    setNumOfFields([...numOfFields, lastNo + 1]);
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
      {isFetching ? (
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
              numOfFields?.map((item, index) => {
                return (
                  <tr key={index + "_material_list"}>
                    <td>
                      <Controller
                        control={control}
                        name={`particular_name_${item}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="Particular name" />
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
                            onChange={(e) => {
                              field.onChange(e);
                              calculateEmpty(item);
                            }}
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
                            placeholder="100"
                            onChange={(e) => {
                              field.onChange(e);
                              calculateEmpty(item);
                            }}
                          />
                        )}
                      />
                    </td>
                    <td>
                      <Controller
                        control={control}
                        name={`empty_${item}`}
                        render={({ field }) => (
                          <Input {...field} placeholder="100" readOnly />
                        )}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <Button danger onClick={() => deleteEntry(item)}>
                        <DeleteOutlined />
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <p>No data</p>
            )}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default MaterialStore;
