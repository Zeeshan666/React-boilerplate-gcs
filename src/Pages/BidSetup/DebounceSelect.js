import { Card, Select, Spin } from 'antd';
import debounce from 'lodash/debounce';
import { useMemo, useRef, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';


function DebounceSelect({ fetchOptions, debounceTimeout = 800, ...props }) {
  const [fetching, setFetching] = useState(false);
  const [options, setOptions] = useState([]);
  const fetchRef = useRef(0);
  const debounceFetcher = useMemo(() => {
    const loadOptions = (value) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setOptions([]);
      setFetching(true);
      fetchOptions(value).then((newOptions) => {
        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }
        setOptions(newOptions);
        setFetching(false);
      });
    };
    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);
  return (
    <Select
      labelInValue
      filterOption={false}
      onSearch={debounceFetcher}
      notFoundContent={fetching ? <Card loading={true}/> : null}
      {...props}
      options={options}
      showSearch = {true}
    />
  );
}



// const DebounceSelectFunction = (mode, fetchMethod, placeholder) => {
//   const [value, setValue] = useState([]);
//   console.log(placeholder)
//   return (
//     <DebounceSelect
//       mode={mode}
//       value={value}
//       placeholder={placeholder}
//       fetchOptions={fetchMethod}
//       onChange={(newValue) => {
//         setValue(newValue);
//       }}
//       style={{
//         width: '100%',
//       }}
//     />
//   );
// };


export default DebounceSelect;