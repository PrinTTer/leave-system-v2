import type { ThemeConfig } from "antd";
import { ThemButtonColor, ThemWebColor } from "./utils/constants";

const theme: ThemeConfig = {
  token: {
    fontSize: 14,
    fontFamily: "Kanit",
  },
  components: {
    Layout: {
      bodyBg: "#F2F2F2",
      headerBg: "#ffffff",
      footerBg: "#ffffff",
      siderBg: ThemWebColor.Background,
    },
    Menu: {
      darkItemColor: "#FFFFFF",
      darkItemHoverColor: "rgba(255, 255, 255, 0.65)",
      darkItemBg: ThemWebColor.Background,
      darkItemSelectedBg: ThemWebColor.Selete,
      darkSubMenuItemBg: ThemWebColor.Background,
    },
    Table: {
      colorTextHeading: "#000000",
      headerBg: "#f5f5f5",
    },
    Button: {
      colorPrimary: ThemButtonColor.Submit,
      colorPrimaryActive: ThemButtonColor.Submit,
      colorPrimaryHover: ThemButtonColor.Submit,
      colorLink: ThemButtonColor.Submit,
    },
  },
};

export default theme;
