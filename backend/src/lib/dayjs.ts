import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/pt-br";

dayjs.locale("pt-br");
dayjs.extend(localizedFormat);

export { dayjs };

/**
 * This file intends to gather dayjs imports and first settings to be used through this application.
 */
