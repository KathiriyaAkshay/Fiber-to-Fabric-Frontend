import { Flex, Modal, Spin, Table, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { getBrokerListRequest } from "../../../api/requests/users";

const ViewBrokersDetailsModel = ({
  isModalOpen,
  handleCancel,
  isScroll = false,
  companyId,
  partyId,
}) => {
  const adjustHeight = {};
  if (isScroll) {
    adjustHeight.height = "calc(100vh - 150px)";
    adjustHeight.overflowY = "scroll";
  }

  const { data: brokerUserListRes, isLoading: isLoadingBrokerList } = useQuery({
    queryKey: ["broker", "list", { company_id: companyId, party_id: partyId }],
    queryFn: async () => {
      const res = await getBrokerListRequest({
        params: {
          company_id: companyId,
          page: 0,
          pageSize: 99999,
          party_id: partyId,
        },
      });
      return res.data?.data;
    },
    enabled: Boolean(companyId && partyId),
  });

  return (
    <>
      <Modal
        closeIcon={<CloseOutlined className="text-white" />}
        title={
          <Typography.Text className="text-xl font-medium text-white">
            {"Party Brokers Details"}
          </Typography.Text>
        }
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
        centered={true}
        classNames={{
          header: "text-center",
        }}
        width={"50%"}
        styles={{
          content: {
            padding: 0,
          },
          header: {
            padding: "16px",
            margin: 0,
          },
          body: {
            padding: "10px 16px",
            ...adjustHeight,
          },
        }}
      >
        <Flex className="flex-col gap-1">
          {isLoadingBrokerList ? (
            <Flex
              style={{
                height: "200px",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Spin />
            </Flex>
          ) : (
            <Table
              className="view-information-table"
              columns={[
                {
                  title: "No",
                  dataIndex: "id",
                  key: "id",
                  render: (text, record, index) => index + 1,
                },
                {
                  title: "Broker Name",
                  dataIndex: "broker_name",
                  key: "broker_name",
                  render: (_, record) =>
                    `${record.first_name} ${record.last_name}`,
                },
              ]}
              dataSource={brokerUserListRes?.brokerList?.rows || []}
              pagination={false}
            />
          )}
        </Flex>
      </Modal>
    </>
  );
};
export default ViewBrokersDetailsModel;
