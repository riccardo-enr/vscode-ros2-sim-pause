"""
test.launch.py — launches everything needed to test vscode-ros2-sim-pause with Gz Harmonic:
  1. Gz Sim (empty world)
  2. ros_gz_bridge  — bridges /world/default/control to ROS 2
  3. pause_shim     — exposes /pause_physics and /unpause_physics (std_srvs/Empty)
  4. test_node      — simple counter node; set a breakpoint in the loop
"""

from ament_index_python.packages import get_package_share_directory
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, ExecuteProcess
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    world_name = LaunchConfiguration('world_name', default='default')
    pkg_share = get_package_share_directory('sim_pause_test')

    gz_sim = ExecuteProcess(
        cmd=['gz', 'sim', '-r', 'empty.sdf'],
        output='screen',
    )

    bridge = Node(
        package='ros_gz_bridge',
        executable='parameter_bridge',
        name='gz_bridge',
        arguments=[
            '/world/default/control@ros_gz_interfaces/srv/ControlWorld'
        ],
        output='screen',
    )

    pause_shim = Node(
        package='sim_pause_test',
        executable='pause_shim',
        name='pause_shim',
        parameters=[{'world_name': world_name}],
        output='screen',
    )

    test_node = Node(
        package='sim_pause_test',
        executable='test_node',
        name='test_node',
        output='screen',
    )

    return LaunchDescription([
        DeclareLaunchArgument('world_name', default_value='default',
                              description='Gz world name'),
        gz_sim,
        bridge,
        pause_shim,
        test_node,
    ])
