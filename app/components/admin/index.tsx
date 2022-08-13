import { Admin, Resource } from "react-admin";
import postgrestRestProvider from "@promitheus/ra-data-postgrest";
import { UserCreate, UserEdit, UserList } from "./resources/user";
import { useTranslation } from "react-i18next";

const dataProvider = postgrestRestProvider("/admin/api");

const AdminApp = () => {
  let { i18n, t } = useTranslation();
  i18n.l;
  return (
    <Admin
      basename="/admin"
      dataProvider={dataProvider}
      i18nProvider={{
        translate: t,
        changeLocale: () => i18n.changeLanguage,
        getLocale: () => i18n.language,
        getLocales: () => i18n.languages,
      }}
    >
      <Resource
        name="User"
        list={UserList}
        edit={UserEdit}
        create={UserCreate}
      />
    </Admin>
  );
};

export default AdminApp;
