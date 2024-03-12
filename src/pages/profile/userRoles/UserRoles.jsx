import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  message,
} from "antd";
import { useCompanyList } from "../../../api/hooks/company";
import {
  getModulePermissionsRequest,
  getPermissionModulesRequest,
  getPermissionUsersRequest,
  updateUserPermissionRequest,
} from "../../../api/requests/permission";
import { useMutation, useQuery } from "@tanstack/react-query";
import PermissionCheckboxes from "../../../components/permission/PermissionCheckboxes";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { useContext, useEffect } from "react";
import { GlobalContext } from "../../../contexts/GlobalContext";
import { DevTool } from "@hookform/devtools";

// const permissionSchema = yup.object().shape({
//   sub_module_id: yup.number().required("Sub Module ID is required"),
//   permission: yup
//     .object()
//     .shape({ [yup.string()]: yup.boolean() })
//     .noUnknown(),
// });

const updatePermissionSchemaResolver = yupResolver(
  yup.object().shape({
    company_id: yup.string(),
    user_id: yup.string(),
    // permissions: yup.array().of(permissionSchema),
    permissions: yup.object(),
  })
);

function UserRoles() {
  const { companyId } = useContext(GlobalContext);
  const { data: companyListRes, isLoading: isLoadingCompanyList } =
    useCompanyList();

  const {
    control,
    handleSubmit,
    formState: { errors },
    // reset,
    watch,
    setValue,
  } = useForm({
    resolver: updatePermissionSchemaResolver,
    defaultValues: {
      company_id: companyId,
    },
  });

  const { company_id, user_id, permissions } = watch();

  const { data: userRes, isLoading: isLoadingUser } = useQuery({
    queryKey: ["dropdown", "permission-user", companyId],
    queryFn: async () => {
      const res = await getPermissionUsersRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.userList;
    },
    enabled: Boolean(companyId),
  });

  const { data: defaultPermissionRes } = useQuery({
    queryKey: ["permission", "modules", "get", companyId],
    queryFn: async () => {
      const res = await getPermissionModulesRequest({
        params: { company_id: companyId },
      });
      return res.data?.data?.modules;
    },
    enabled: Boolean(companyId),
  });

  const { data: allowedPermissionsRes } = useQuery({
    queryKey: ["permission", "get", company_id, user_id],
    queryFn: async () => {
      const res = await getModulePermissionsRequest({
        companyId: companyId,
        userId: user_id,
        params: { company_id: company_id },
      });
      return res.data?.data;
    },
    enabled: Boolean(company_id && user_id),
  });

  // console.log("allowedPermissionsRes----->", allowedPermissionsRes);

  const { mutateAsync: updatePermissions } = useMutation({
    mutationFn: async (data) => {
      const res = await updateUserPermissionRequest({
        companyId: company_id,
        userId: user_id,
        data,
        params: { company_id: companyId },
      });
      return res.data;
    },
    mutationKey: ["permission", "update", companyId, user_id],
    onSuccess: (res) => {
      // queryClient.invalidateQueries(["machine", "list", companyId]);
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

  async function onSubmit(data) {
    console.log(data);
    // await updatePermissions({ permissions: permissions });
  }

  async function handleUpdatePermission() {
    // console.log(permissions);
    const updatedPermissions = {};
    Object.entries(permissions || {}).forEach(([key, value]) => {
      updatedPermissions[key] = value?.operations || {};
    });
    // console.log("updatedPermissions", updatedPermissions);
    await updatePermissions({
      permissions: updatedPermissions,
    });
  }

  function renderPermissionCards() {
    return defaultPermissionRes?.map(
      ({ name = "", id = 0, sub_modules = [] }) => {
        return (
          <Card
            title={<div className="text-white">{name}</div>}
            bordered={false}
            key={id}
          >
            {sub_modules?.map((sub_module) => {
              return (
                <PermissionCheckboxes
                  key={`${sub_module?.id}`}
                  module={sub_module}
                  control={control}
                  watch={watch}
                  setValue={setValue}
                />
              );
            })}
          </Card>
        );
      }
    );
  }

  useEffect(() => {
    if (allowedPermissionsRes?.permission) {
      setValue("permissions", allowedPermissionsRes?.permission);
    }
  }, [allowedPermissionsRes, setValue]);

  return (
    <Flex className="flex-col mx-20 my-6">
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <Row
          style={{
            width: "100%",
          }}
          gutter={18}
        >
          <Col span={10}>
            <Form.Item
              label="Select Company"
              name="company_id"
              validateStatus={errors.company_id ? "error" : ""}
              help={errors.company_id && errors.company_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="company_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Please Select Company"
                    loading={isLoadingCompanyList}
                    options={companyListRes?.rows?.map(
                      ({ company_name = "", id = "" }) => ({
                        label: company_name,
                        value: id,
                      })
                    )}
                    style={{
                      width: "100%",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={5}>
            <Form.Item
              label="Select User"
              name="user_id"
              validateStatus={errors.user_id ? "error" : ""}
              help={errors.user_id && errors.user_id.message}
              wrapperCol={{ sm: 24 }}
            >
              <Controller
                control={control}
                name="user_id"
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select user"
                    loading={isLoadingUser}
                    options={userRes?.rows?.map(
                      ({ first_name = "", last_name = "", id = "" }) => ({
                        label: `${first_name} ${last_name}`,
                        value: id,
                      })
                    )}
                    style={{
                      width: "100%",
                    }}
                  />
                )}
              />
            </Form.Item>
          </Col>

          <Col span={5}>
            <Form.Item label="Search" wrapperCol={{ sm: 24 }}>
              <Input placeholder="search" />
            </Form.Item>
          </Col>

          <Col span={4} style={{ display: "flex", alignItems: "end" }}>
            <Form.Item>
              <Button type="primary" onClick={handleUpdatePermission}>
                Update
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Flex className="flex-col gap-5">{renderPermissionCards()}</Flex>
      </Form>
      <DevTool control={control} />
    </Flex>
  );
}

export default UserRoles;
