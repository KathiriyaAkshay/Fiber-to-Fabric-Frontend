import { Button, Card, Col, Flex, Form, Input, Row, Select } from "antd";
import { useCompanyList } from "../../../api/hooks/company";
import {
  getPermissionModulesRequest,
  getPermissionUsersRequest,
} from "../../../api/requests/permission";
import { useQuery } from "@tanstack/react-query";
import PermissionCheckboxes from "../../../components/permission/PermissionCheckboxes";

function UserRoles() {
  const { data: companyListRes, isLoading: isLoadingCompanyList } =
    useCompanyList();

  const companyId = companyListRes?.rows?.[0]?.id;

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

  return (
    <Flex className="flex-col mx-20 my-6">
      <Row
        style={{
          width: "100%",
        }}
        gutter={18}
      >
        <Col span={10}>
          <Form.Item label="Select Company" wrapperCol={{ sm: 24 }}>
            <Select
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
          </Form.Item>
        </Col>

        <Col span={5}>
          <Form.Item label="Select User" wrapperCol={{ sm: 24 }}>
            <Select
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
      <Flex className="flex-col gap-5">
        {defaultPermissionRes?.map(
          ({ name = "", id = 0, sub_modules = [] }) => {
            return (
              <Card
                title={<div className="text-white">{name}</div>}
                bordered={false}
                key={id}
                headerBg
              >
                {sub_modules?.map((sub_module) => {
                  return <PermissionCheckboxes key={id} module={sub_module} />;
                })}
              </Card>
            );
          }
        )}
      </Flex>
    </Flex>
  );
}

export default UserRoles;
