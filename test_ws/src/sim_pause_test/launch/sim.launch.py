"""
sim.launch.py — launches Gazebo + bridge + pause_shim only.
Use this as a preLaunchTask, then debug test_node via RDE.
"""

from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, ExecuteProcess
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    world_name = LaunchConfiguration('world_name', default='default')

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

    return LaunchDescription([
        DeclareLaunchArgument('world_name', default_value='default',
                              description='Gz world name'),
        gz_sim,
        bridge,
        pause_shim,
    ])
