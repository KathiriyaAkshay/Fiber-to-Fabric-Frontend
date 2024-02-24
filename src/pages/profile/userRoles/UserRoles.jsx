import { Button, Card, Col, Flex, Form, Input, Row, Select } from "antd";
import { useCompanyList } from "../../../api/hooks/company";
import {
  getModulePermissionsRequest,
  getPermissionModulesRequest,
  getPermissionUsersRequest,
} from "../../../api/requests/permission";
import { useQuery } from "@tanstack/react-query";
import PermissionCheckboxes from "../../../components/permission/PermissionCheckboxes";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useEffect } from "react";

const permissionSchema = yup.object().shape({
  sub_module_id: yup.number().required("Sub Module ID is required"),
  permission: yup
    .object()
    .shape({ [yup.string()]: yup.boolean() })
    .noUnknown(),
});

const updatePermissionSchemaResolver = yupResolver(
  yup.object().shape({
    company_id: yup.string(),
    user_id: yup.string(),
    permissions: yup.array().of(permissionSchema),
  })
);

function UserRoles() {
  const { data: companyListRes, isLoading: isLoadingCompanyList } =
    useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: updatePermissionSchemaResolver,
    defaultValues: {
      company_id: companyId,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "permissions",
  });

  const { company_id, user_id } = watch();

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
        params: { company_id: company_id },
      });
      return res.data?.data;
    },
    enabled: Boolean(company_id && user_id),
  });

  async function onSubmit(data) {
    console.log(data);
    // await addMachine({ ...data, company_id: companyId });
  }

  function renderPermissionCards() {
    let index = 0;
    return defaultPermissionRes?.map(
      ({ name = "", id = 0, sub_modules = [] }) => {
        return (
          <Card
            title={<div className="text-white">{name}</div>}
            bordered={false}
            key={id}
          >
            {sub_modules?.map((sub_module) => {
              const sub_module_index = index;
              index += 1;
              return (
                <PermissionCheckboxes
                  key={`${sub_module?.id}`}
                  module={sub_module}
                  sub_module_index={sub_module_index}
                />
              );
            })}
          </Card>
        );
      }
    );
  }

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
              <Button type="primary" disabled={true}>
                Update
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Flex className="flex-col gap-5">{renderPermissionCards()}</Flex>
      </Form>
    </Flex>
  );
}

export default UserRoles;
