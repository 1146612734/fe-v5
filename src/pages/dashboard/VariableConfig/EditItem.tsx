import React, { useRef, useEffect, useState } from 'react';
import { Modal, Form, Input, Button, Space, Row, Col, Switch } from 'antd';
import { useTranslation } from 'react-i18next';
import { DeleteOutlined, PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, CopyOutlined } from '@ant-design/icons';
import PromqlEditor from '@/components/PromqlEditor';
import '../index.less';
import { Variable } from './definition';
import { convertExpressionToQuery, replaceExpressionVars } from './constant';

export interface FormType {
  var: Variable[];
}
interface Props {
  visible: boolean;
  value: FormType | undefined;
  onChange: (v: FormType | undefined) => void;
}
export default function EditItem(props: Props) {
  const { visible, onChange, value } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();
  useEffect(() => {
    value && form.setFieldsValue(value);
  }, [value]);
  const handleOk = async () => {
    await form.validateFields();
    const v: FormType = form.getFieldsValue();
    onChange(v);
  };
  const onCancel = () => {
    onChange(undefined);
  };

  const onFinish = (values) => {
    console.log('Received values of form:', values);
  };

  const handleBlur = (e, index) => {
    const expression = e.target.value;
    const formData = form.getFieldsValue();
    var newExpression = replaceExpressionVars(expression, formData, index);
    convertExpressionToQuery(newExpression).then((res) => {
      form.setFields([{ name: ['var', index, 'selected'], value: res[0] }]);
    });
  };

  return (
    <Modal title={t('大盘变量')} width={900} visible={visible} onOk={handleOk} onCancel={onCancel}>
      <Form name='dynamic_form_nest_item' onFinish={onFinish} autoComplete='off' preserve={false} form={form}>
        <Row gutter={[6, 6]} className='tag-header'>
          <Col span={4}>{t('变量名')}</Col>
          <Col span={6}>{t('变量定义')}</Col>
          <Col span={6}>{t('筛值正则')}</Col>
          <Col span={2}>{t('Multi')}</Col>
          <Col span={2}>{t('All Option')}</Col>
          <Col span={4}>{t('操作')}</Col>
        </Row>
        <Form.List name='var'>
          {(fields, { add, remove, move }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <Row gutter={[6, 6]} className='tag-content-item'>
                  <Col span={4}>
                    <Form.Item {...restField} name={[name, 'name']} fieldKey={[fieldKey, 'name']} rules={[{ required: true, message: t('请输入变量名') }]}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'definition']} fieldKey={[fieldKey, 'definition']} rules={[{ required: true, message: t('请输入变量定义') }]}>
                      <Input onBlur={(v) => handleBlur(v, name)} />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item {...restField} name={[name, 'reg']} fieldKey={[fieldKey, 'reg']}>
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item {...restField} name={[name, 'multi']} fieldKey={[fieldKey, 'multi']} valuePropName='checked'>
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={2}>
                    <Form.Item {...restField} name={[name, 'allOption']} fieldKey={[fieldKey, 'allOption']} valuePropName='checked'>
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Form.Item {...restField} name={[name, 'selected']} fieldKey={[fieldKey, 'selected']} hidden>
                    <Input />
                  </Form.Item>
                  <Col span={4}>
                    <Button type='link' size='small' onClick={() => move(name, name + 1)} disabled={name === fields.length - 1}>
                      <ArrowDownOutlined />
                    </Button>
                    <Button type='link' size='small' onClick={() => move(name, name - 1)} disabled={name === 0}>
                      <ArrowUpOutlined />
                    </Button>
                    <Button
                      type='link'
                      size='small'
                      onClick={() => {
                        const v = form.getFieldValue(['var', name]);
                        add({ ...v, name: 'copy_of_' + v.name });
                      }}
                    >
                      <CopyOutlined />
                    </Button>
                    <Button type='link' size='small' onClick={() => remove(name)}>
                      <DeleteOutlined />
                    </Button>
                  </Col>
                </Row>
              ))}
              <Form.Item>
                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                  {t('新增变量')}
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}
