# Get Started Examples[[English]](./examples/get-started/README.md)

本示例演示了如何通过两个 ESP32 芯片之间的通信获取 CSI 数据，并使用图形界面显示 CSI 子载波的实时数据。

## 硬件

您需要准备两块开发板，一块作为发送方，一块作为接收方。

![example_display](./docs/_static/example_display.png)

为了保证 CSI 的感知效果，请尽量满足以下要求：
1. Use ESP32-C3 / ESP32-S3: ESP32-C3 / ESP32-S3 is the best RF chip at present
2. Use an external antenna: PCB antenna has poor directivity and is easily interfered by the motherboard
3. The distance between the two devices is more than one meter

## 绑定

1. 分别烧录 `csi_recv` and `csi_send` 到两块 ESP32 上。

    ![device_log](./docs/_static/device_log.png)

    ```shell
    # csi_send
    cd esp-csi/examples/get-started/csi_send
    idf.py set-target esp32c3
    idf.py flash -b 921600 -p /dev/ttyUSB0 monitor

    # csi_recv
    cd esp-csi/examples/get-started/csi_recv
    idf.py set-target esp32c3
    idf.py flash -b 921600 -p /dev/ttyUSB1
    ```

2. 在 `csi_recv` 里运行 `csi_data_read_parse.py` 做数据分析。 在运行前请关闭 `idf.py monitor` 。

    ```shell
    cd esp-csi-gitlab/examples/get-started/tools

    # Install python related dependencies
    pip install -r requirements.txt

    # Graphical display
    python csi_data_read_parse.py -p /dev/ttyUSB1
    ```

## CSI 数据格式

以一行 CSI raw data 为例：

> type,seq,mac,rssi,rate,sig_mode,mcs,bandwidth,smoothing,not_sounding,aggregation,stbc,fec_coding,sgi,noise_floor,ampdu_cnt,channel,secondary_channel,local_timestamp,ant,sig_len,rx_state,len,first_word,data
CSI_DATA,0,94:d9:b3:80:8c:81,-30,11,1,6,1,0,1,0,1,0,0,-93,0,13,2,2751923,0,67,0,128,1,"[67,48,4,0,0,0,0,0,0,0,5,0,20,1,20,1,19,0,17,1,16,2,15,2,14,1,12,0,12,-1,12,-3,12,-4,13,-6,15,-7,16,-8,16,-8,16,-8,16,-6,15,-5,15,-4,14,-4,13,-4,12,-4,11,-4,10,-4,9,-5,8,-6,4,-4,8,-9,9,-10,9,-10,10,-11,11,-10,11,-10,12,-9,11,-8,11,-7,10,-6,9,-6,7,-6,6,-7,5,-7,5,-8,5,-9,5,-10,5,-11,5,-11,6,-11,7,-11,8,-11,9,-10,9,-9,8,-8,8,-7,1,-2,0,0,0,0,0,0,0,0]"

- **元数据字段**：包括 type, seq, mac, rssi, rate, .. , len,first_word 等。
- **CSI 数据**：由最后一项 data 数组存储，用 [...] 框起。包含每个子载波的信道状态信息。具体结构可参考 [ESP-WIFI-CSI Guide](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/api-guides/wifi.html#wi-fi-channel-state-information) 的 Long Training Field (LTF) 部分。对于每一个子载波，先储存虚数部分，再储存实数部分（即：[子载波1的虚部，子载波1的实部，子载波2的虚部，子载波2的实部，子载波3的虚部，子载波3的实部，...]）。

LTF的顺序为：LLTF、HT-LTF、STBC-HT-LTF。根据通道和分组信息，可能不会出现所有3个LTF。
he order of LTF is: LLTF, HT-LTF, STBC-HT-LTF. Depending on the channel and grouping information, not all 3 LTFs may appear.

## A&Q

 ### 1. csi_send 打印无内存

- **现象**：串口上出现以下日志：
```shell
  W (510693) csi_send:  ESP-NOW 发送错误
```
- **原因**：当前信道拥堵，导致发送数据包时出现拥堵，ESP-NOW 缓冲区空间满
- **解决方案**：更换 Wi-Fi 信道或更换到网络环境更好的地方
### 2. csi_data_read_parse.py 串口打印异常

- **现象**：串口上出现以下日志：
```shell
  element number is not equal
  data is not incomplete
```
- **原因**：绘图时 PYQT 占用大量 CPU，导致 PC 无法及时读取串口缓冲队列，造成数据混乱
- **解决方案**：提高串口的波特率
