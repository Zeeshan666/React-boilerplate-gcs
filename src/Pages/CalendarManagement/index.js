import {
  DatePicker,
  Tabs,
  Tooltip,
  Progress,
  Collapse,
  Space,
  Statistic,
  Table,
  Typography,
} from "antd";
import Public from "./Public";
import Leave from "./Leave";

const { TabPane } = Tabs;

function CalendarManagement() {
  return (
    <>
      <Tabs destroyInactiveTabPane className="bid-manage-tab calendar-management">
        <TabPane
          tab={
            <>
              {" "}
              <div className="tab-header">Public Holidays</div>{" "}
            </>
          }
          key="1"
        >
          <Public tab={'public'} />
        </TabPane>

        <TabPane
          tab={
            <>
              {" "}
              <div className="tab-header">Leave Management</div>{" "}
            </>
          }
          key="2"
        >
          <Leave  tab={'leave'} />
        </TabPane>
      </Tabs>
    </>
  );
}
export default CalendarManagement;
