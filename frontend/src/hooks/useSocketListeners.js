import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSocket, joinTenantRoom, leaveTenantRoom } from '../services/socket';
import {
  handleTaskCreated,
  handleTaskUpdated,
  handleTaskMoved,
  handleTaskDeleted,
} from '../redux/slices/taskSlice';
import {
  handleColumnCreated,
  handleColumnUpdated,
  handleColumnDeleted,
  handleColumnReordered,
} from '../redux/slices/boardSlice';
import {
  handleMemberJoined,
  handleMemberLeft,
  handleMemberRoleUpdated,
} from '../redux/slices/tenantSlice';
import { setPresence } from '../redux/slices/presenceSlice';
import { handleNewActivity } from '../redux/slices/activitySlice';

export const useSocketListeners = () => {
  const dispatch = useDispatch();
  const { token, currentTenantId, currentOrgId, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token || !currentTenantId) return;

    const socket = getSocket();
    if (!socket) return;

    joinTenantRoom(currentTenantId, currentOrgId);

    const onTaskCreated = (task) => dispatch(handleTaskCreated(task));
    const onTaskUpdated = (task) => dispatch(handleTaskUpdated(task));
    const onTaskMoved = (data) => dispatch(handleTaskMoved(data));
    const onTaskDeleted = (data) => dispatch(handleTaskDeleted(data));

    const onColumnCreated = (column) => dispatch(handleColumnCreated(column));
    const onColumnUpdated = (column) => dispatch(handleColumnUpdated(column));
    const onColumnDeleted = (data) => dispatch(handleColumnDeleted(data));
    const onColumnReordered = (data) => dispatch(handleColumnReordered(data));

    const onMemberJoined = (member) => dispatch(handleMemberJoined(member));
    const onMemberLeft = (data) => dispatch(handleMemberLeft(data));
    const onMemberRoleUpdated = (member) => dispatch(handleMemberRoleUpdated(member));

    const onPresenceUpdate = (presenceData) => {
      if (presenceData.tenantId === currentTenantId) {
        dispatch(setPresence(presenceData));
      }
    };

    const onActivityNew = (activity) => dispatch(handleNewActivity(activity));

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:moved', onTaskMoved);
    socket.on('task:deleted', onTaskDeleted);

    socket.on('column:created', onColumnCreated);
    socket.on('column:updated', onColumnUpdated);
    socket.on('column:deleted', onColumnDeleted);
    socket.on('column:reordered', onColumnReordered);

    socket.on('member:joined', onMemberJoined);
    socket.on('member:left', onMemberLeft);
    socket.on('member:role_updated', onMemberRoleUpdated);

    socket.on('presence:update', onPresenceUpdate);
    socket.on('activity:new', onActivityNew);

    return () => {
      leaveTenantRoom(currentTenantId);
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:moved', onTaskMoved);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('column:created', onColumnCreated);
      socket.off('column:updated', onColumnUpdated);
      socket.off('column:deleted', onColumnDeleted);
      socket.off('column:reordered', onColumnReordered);
      socket.off('member:joined', onMemberJoined);
      socket.off('member:left', onMemberLeft);
      socket.off('member:role_updated', onMemberRoleUpdated);
      socket.off('presence:update', onPresenceUpdate);
      socket.off('activity:new', onActivityNew);
    };
  }, [dispatch, isAuthenticated, token, currentTenantId, currentOrgId]);
};

export default useSocketListeners;
